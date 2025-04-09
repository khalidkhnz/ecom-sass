import { z } from "zod";
import { addressSchema } from "./address";

// Order creation schema
export const createOrderSchema = z.object({
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  useShippingAsBilling: z.boolean().optional(),
  paymentMethod: z.enum(["razorpay"]),
  customerNote: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Order verification schema for Razorpay
export const verifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// Response data schema
export const orderResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
  redirectUrl: z.string().optional(),
  paymentData: z.record(z.any()).optional(),
  error: z.any().optional(),
});

export type OrderResponse = z.infer<typeof orderResponseSchema>;
