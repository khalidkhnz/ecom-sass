"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { getPendingPaymentData } from "@/app/actions/orders";

interface CompletePaymentButtonProps {
  orderId: string;
}

export default function CompletePaymentButton({
  orderId,
}: CompletePaymentButtonProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  // Handle the payment process
  const handleCompletePayment = async () => {
    try {
      setProcessing(true);

      // Get payment data for the pending order
      const result = await getPendingPaymentData(orderId);

      if (!result.success) {
        toast.error("Payment Error", {
          description: result.message || "Failed to get payment information",
        });
        return;
      }

      // Handle Razorpay payment
      const options = {
        key: result?.paymentData?.key,
        amount: result?.paymentData?.amount,
        currency: result?.paymentData?.currency,
        name: result?.paymentData?.name,
        description: result?.paymentData?.description,
        order_id: result?.paymentData?.orderId,
        prefill: result?.paymentData?.prefill,
        notes: result?.paymentData?.notes,
        theme: {
          color: "#3B82F6",
        },
        handler: function (response: any) {
          // Handle the successful payment
          handlePaymentSuccess({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
      };

      // Open Razorpay payment window
      const razorpayInstance = (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Failed to process payment:", error);
      toast.error("Payment Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentResponse: any) => {
    router.push(
      `/checkout/processing?orderId=${paymentResponse.orderId}&paymentId=${paymentResponse.paymentId}&signature=${paymentResponse.signature}`
    );
  };

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={handleCompletePayment}
        disabled={processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Processing
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-3 w-3" />
            Complete Payment
          </>
        )}
      </Button>
    </>
  );
}
