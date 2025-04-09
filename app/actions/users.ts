"use server";

import { db } from "@/lib/db";
import { users, orders, cartItems } from "@/lib/schema";
import { sql, desc, eq, and, or, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorize";

// Get all users with pagination
export async function getUsers(page = 1, limit = 10, search = "") {
  try {
    // Check admin access
    await authorize("admin");

    const offset = (page - 1) * limit;

    // Base query to select users
    let query: any = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    // Add search condition if provided
    if (search) {
      query = query.where(
        or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      );
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(
        search
          ? sql`(name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})`
          : sql`1=1`
      );

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Execute the query with pagination
    const results = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Get order counts for each user
    const userIds = results.map((user: any) => user.id);

    if (userIds.length === 0) {
      return {
        success: true,
        users: [],
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
        },
      };
    }

    // Get order counts
    const orderCounts = await db
      .select({
        userId: orders.userId,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(sql`user_id IN (${userIds.join(",")})`)
      .groupBy(orders.userId);

    // Create a map of user IDs to order counts
    const orderCountMap = orderCounts.reduce((map, item) => {
      map[item.userId] = item.count;
      return map;
    }, {} as Record<string, number>);

    // Combine user data with order counts
    const usersWithStats = results.map((user: any) => ({
      ...user,
      orderCount: orderCountMap[user.id] || 0,
    }));

    return {
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
      },
    };
  } catch (error: any) {
    console.error("Error getting users:", error);
    return {
      success: false,
      message: error.message || "Failed to get users",
      users: [],
      pagination: {
        page,
        limit,
        totalPages: 0,
        totalCount: 0,
      },
    };
  }
}

// Get detailed information about a specific user
export async function getUserDetails(userId: string) {
  try {
    // Check admin access
    await authorize("admin");

    // Get user profile
    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        adminNotes: true,
      },
    });

    if (!userProfile) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Get user orders
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)],
      limit: 5,
    });

    // Get user's cart items
    const cartItemsResult = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, userId),
      with: {
        product: true,
        variant: true,
      },
    });

    // Calculate statistics
    const totalSpent = userOrders.reduce((sum, order) => {
      return sum + parseFloat(order.grandTotal);
    }, 0);

    const lastOrderDate =
      userOrders.length > 0 ? userOrders[0].createdAt : null;

    // Get addresses from the user profile's JSON field
    const userAddresses = userProfile.addresses || [];

    // Format user data with statistics
    return {
      success: true,
      user: {
        ...userProfile,
        statistics: {
          totalOrders: userOrders.length,
          totalSpent,
          lastOrderDate,
          addressCount: userAddresses.length,
          cartItemCount: cartItemsResult.length,
        },
        recentOrders: userOrders,
        addresses: userAddresses,
        cartItems: cartItemsResult,
      },
    };
  } catch (error: any) {
    console.error("Error getting user details:", error);
    return {
      success: false,
      message: error.message || "Failed to get user details",
    };
  }
}

// Update user (currently only admin notes - could be expanded)
export async function updateUser(
  userId: string,
  data: { adminNotes?: string }
) {
  try {
    // Check admin access
    await authorize("admin");

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Update user
    await db
      .update(users)
      .set({
        adminNotes: data.adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Revalidate paths
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: error.message || "Failed to update user",
    };
  }
}
