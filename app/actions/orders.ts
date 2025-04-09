"use server";

import { db } from "@/lib/db";
import { orders, orderItems, payments, cartItems, users } from "@/lib/schema";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@/lib/auth";
import { getCart, clearCart } from "./cart";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { sql } from "drizzle-orm";
import {
  createOrderSchema,
  verifyPaymentSchema,
  type CreateOrderInput,
  type VerifyPaymentInput,
} from "@/zod/order";

// Initialize Razorpay SDK
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper to generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${timestamp.slice(-8)}-${randomPart}`;
}

// Helper to get current user
async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be logged in to place an order");
  }

  return session.user;
}

// Create an order
export async function createOrder(input: CreateOrderInput) {
  try {
    // Validate the input
    const validatedData = createOrderSchema.parse(input);

    // Get the current user
    const user = await getCurrentUser();
    const userId = user.id;

    // Get the cart
    const cart = await getCart();

    if (!cart.items.length) {
      return {
        success: false,
        message: "Your cart is empty",
      };
    }

    // Generate a unique order number
    const orderNumber = generateOrderNumber();

    // Use shipping address as billing if requested
    const billingAddress = validatedData.useShippingAsBilling
      ? validatedData.shippingAddress
      : validatedData.billingAddress;

    // Create a new ID for the order
    const orderId = createId();

    // Create the order record
    await db.insert(orders).values({
      userId,
      id: orderId,
      orderNumber,
      status: "pending",
      subTotal: cart.subtotal.toString(),
      taxAmount: "0",
      shippingAmount: "0",
      discountAmount: "0",
      grandTotal: cart.subtotal.toString(),
      shippingAddress: validatedData.shippingAddress,
      billingAddress,
      customerNote: validatedData.customerNote || "",
      paymentMethod: validatedData.paymentMethod,
      paymentStatus: "pending",
    });

    // Get the created order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    // Create the order items
    for (const item of cart.items) {
      const productData = {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        discountPrice: item.product.discountPrice,
        images: item.product.images,
        slug: item.product.slug,
        taxable: item.product.taxable,
        taxRate: item.product.taxRate,
        taxType: item.product.taxType,
        // Include variant data if available
        variant: item.variant || null,
      };

      // Determine the price to use
      const price = item.variant?.price
        ? parseFloat(String(item.variant.price))
        : item.product.discountPrice
        ? parseFloat(String(item.product.discountPrice))
        : parseFloat(String(item.product.price));

      // Generate an ID for the order item
      const orderItemId = createId();

      await db.insert(orderItems).values({
        id: orderItemId,
        orderId: order.id,
        productId: item.product.id,
        variantId: item.variant?.id || null,
        sku: "SKU-" + item.product.id, // Generate a fallback SKU
        name: item.product.name,
        price: price.toString(),
        quantity: item.quantity.toString(),
        totalPrice: (price * item.quantity).toString(),
        productData,
      });
    }

    // Create Razorpay order (convert to paise - smallest currency unit in India)
    const amountInPaise = Math.round(parseFloat(order.grandTotal) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId: userId,
      },
    });

    // Update the order with Razorpay order ID
    const paymentDetails = {
      razorpayOrderId: razorpayOrder.id,
    };

    await db
      .update(orders)
      .set({
        paymentDetails,
      })
      .where(eq(orders.id, order.id));

    // Return the success response with Razorpay data
    return {
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentData: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        name: process.env.NEXT_PUBLIC_SITE_NAME || "E-Commerce Store",
        description: `Payment for order ${order.orderNumber}`,
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: billingAddress.phone || "",
        },
        notes: {
          address: `${billingAddress.addressLine1}, ${billingAddress.city}, ${billingAddress.state}, ${billingAddress.country}`,
        },
      },
    };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: error.message || "Failed to create order",
      error,
    };
  }
}

// Verify Razorpay payment
export async function verifyPayment(input: VerifyPaymentInput) {
  try {
    // Validate the input
    const validatedData = verifyPaymentSchema.parse(input);

    // Find the order using Razorpay Order ID by using a raw query
    const result = await db.execute(sql`
      SELECT * FROM "orders" 
      WHERE payment_details->>'razorpayOrderId' = ${validatedData.orderId}
      LIMIT 1
    `);

    // Since this is a raw query, we need to handle the result differently
    if (!result.rows || result.rows.length === 0) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Get the first row from the result
    const order = result.rows[0];

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${validatedData.orderId}|${validatedData.paymentId}`)
      .digest("hex");

    // Check if signature matches
    const isValid = generatedSignature === validatedData.signature;

    if (!isValid) {
      // Update the order payment status to failed using raw SQL
      await db.execute(sql`
        UPDATE "orders"
        SET 
          "payment_status" = 'failed',
          "status" = 'payment_failed'
        WHERE "id" = ${order.id}
      `);

      return {
        success: false,
        message: "Payment verification failed",
      };
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(
      validatedData.paymentId
    );

    // Generate an ID for the payment
    const paymentId = createId();

    // Record the payment with raw SQL
    await db.execute(sql`
      INSERT INTO "payments" (
        "id", 
        "order_id", 
        "razorpay_order_id", 
        "razorpay_payment_id", 
        "razorpay_signature", 
        "amount", 
        "currency", 
        "method", 
        "status", 
        "payment_data",
        "created_at",
        "updated_at"
      ) VALUES (
        ${paymentId},
        ${order.id},
        ${validatedData.orderId},
        ${validatedData.paymentId},
        ${validatedData.signature},
        ${order.grand_total},
        'INR',
        'razorpay',
        ${paymentDetails.status},
        ${JSON.stringify(paymentDetails)},
        now(),
        now()
      )
    `);

    // Update the order payment status with new payment details using raw SQL
    const newPaymentDetails = JSON.stringify({
      razorpayOrderId: validatedData.orderId,
      paymentId: validatedData.paymentId,
      signature: validatedData.signature,
      paymentStatus: "completed",
    });

    await db.execute(sql`
      UPDATE "orders"
      SET 
        "payment_status" = 'completed',
        "status" = 'processing',
        "payment_details" = ${newPaymentDetails}::jsonb
      WHERE "id" = ${order.id}
    `);

    // Clear the cart after successful payment
    await clearCart();

    // Revalidate relevant paths
    revalidatePath("/checkout/success");
    revalidatePath("/user/orders");

    return {
      success: true,
      message: "Payment verified successfully",
      orderId: order.id,
      orderNumber: order.order_number,
      redirectUrl: `/checkout/success?orderId=${order.id}`,
    };
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      message: error.message || "Failed to verify payment",
      error,
    };
  }
}

// Get order by ID
export async function getOrderById(orderId: string) {
  try {
    const user = await getCurrentUser();

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, user.id)),
      with: {
        items: true,
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error("Error getting order:", error);
    return {
      success: false,
      message: error.message || "Failed to get order",
      error,
    };
  }
}

// Get all orders for the current user
export async function getUserOrders() {
  try {
    const user = await getCurrentUser();

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, user.id),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });

    return {
      success: true,
      orders: userOrders,
    };
  } catch (error: any) {
    console.error("Error getting user orders:", error);
    return {
      success: false,
      message: error.message || "Failed to get orders",
      error,
    };
  }
}

// Get payment data for a pending order to allow users to complete payment
export async function getPendingPaymentData(orderId: string) {
  try {
    const user = await getCurrentUser();

    // Get the order
    const order: any = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.userId, user.id),
        eq(orders.paymentStatus, "pending")
      ),
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found or payment is not pending",
      };
    }

    // Check if payment details exist with razorpayOrderId
    if (!order.paymentDetails?.razorpayOrderId) {
      return {
        success: false,
        message: "Payment information not found for this order",
      };
    }

    // Get user information for prefill
    const userInfo = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        name: true,
        email: true,
      },
    });

    // Return the payment data
    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentData: {
        orderId: order.paymentDetails.razorpayOrderId,
        amount: parseFloat(order.grandTotal) * 100, // Convert to paise
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
        name: process.env.NEXT_PUBLIC_SITE_NAME || "E-Commerce Store",
        description: `Payment for order ${order.orderNumber}`,
        prefill: {
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          contact: order.billingAddress?.phone || "",
        },
        notes: {
          address: `${order.billingAddress?.addressLine1}, ${order.billingAddress?.city}, ${order.billingAddress?.state}, ${order.billingAddress?.country}`,
        },
      },
    };
  } catch (error: any) {
    console.error("Error getting pending payment data:", error);
    return {
      success: false,
      message: error.message || "Failed to get payment information",
      error,
    };
  }
}

// ADMIN ACTIONS

// Helper to check if user is admin
async function checkAdminAccess() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be logged in to access this resource");
  }

  if (session.user.role !== "admin") {
    throw new Error("You don't have permission to access this resource");
  }

  return session.user;
}

// Admin: Get all orders
export async function getAllOrders(
  page = 1,
  limit = 10,
  filters?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }
) {
  try {
    // Check admin access
    await checkAdminAccess();

    const offset = (page - 1) * limit;

    // Build the SQL query
    let query: any = db.select().from(orders);

    // Apply filters
    if (filters) {
      // Filter by status
      if (filters.status && filters.status !== "all") {
        query = query.where(eq(orders.status, filters.status));
      }

      // Filter by payment status
      if (filters.paymentStatus && filters.paymentStatus !== "all") {
        query = query.where(eq(orders.paymentStatus, filters.paymentStatus));
      }

      // Search by order number
      if (filters.search) {
        query = query.where(
          sql`${orders.orderNumber} ILIKE ${"%" + filters.search + "%"} OR 
              ${orders.userId} ILIKE ${"%" + filters.search + "%"} OR
              EXISTS (
                SELECT 1 FROM ${users}
                WHERE ${users.id} = ${orders.userId}
                AND (
                  ${users.name} ILIKE ${"%" + filters.search + "%"} OR
                  ${users.email} ILIKE ${"%" + filters.search + "%"}
                )
              ) OR
              ${orders.billingAddress}->>'name' ILIKE ${
            "%" + filters.search + "%"
          } OR
              ${orders.billingAddress}->>'addressLine1' ILIKE ${
            "%" + filters.search + "%"
          } OR
              ${orders.billingAddress}->>'city' ILIKE ${
            "%" + filters.search + "%"
          } OR
              ${orders.billingAddress}->>'postalCode' ILIKE ${
            "%" + filters.search + "%"
          } OR
              ${orders.billingAddress}->>'phone' ILIKE ${
            "%" + filters.search + "%"
          } OR
              ${orders.shippingAddress}->>'phone' ILIKE ${
            "%" + filters.search + "%"
          }`
        );
      }

      // Date range filter
      if (filters.fromDate) {
        query = query.where(
          sql`${orders.createdAt} >= ${new Date(filters.fromDate)}`
        );
      }

      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999); // Set to end of day
        query = query.where(sql`${orders.createdAt} <= ${toDate}`);
      }
    }

    // Count total matching orders
    const countResult = await db.select({ count: sql`count(*)` }).from(orders);
    const totalOrders = Number(countResult[0].count);

    // Get paginated results
    const allOrders = await query
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      orders: allOrders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit),
      },
    };
  } catch (error: any) {
    console.error("Error getting all orders:", error);
    return {
      success: false,
      message: error.message || "Failed to get orders",
      error,
    };
  }
}

// Admin: Get order details with items
export async function getOrderDetails(orderId: string) {
  try {
    // Check admin access
    await checkAdminAccess();

    // Get order with items
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Get user details for the order
    const user = await db.query.users.findFirst({
      where: eq(users.id, order.userId),
      columns: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      success: true,
      order: {
        ...order,
        user,
      },
    };
  } catch (error: any) {
    console.error("Error getting order details:", error);
    return {
      success: false,
      message: error.message || "Failed to get order details",
      error,
    };
  }
}

// Admin: Update order status
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    // Check admin access
    await checkAdminAccess();

    // Find the order
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Update the order status
    await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // If the status is "delivered" or "completed", update the payment status to completed
    if (status === "delivered" || status === "completed") {
      await db
        .update(orders)
        .set({
          paymentStatus: "completed",
        })
        .where(eq(orders.id, orderId));
    }

    return {
      success: true,
      message: "Order status updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: error.message || "Failed to update order status",
      error,
    };
  }
}
