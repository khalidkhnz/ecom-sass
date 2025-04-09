"use client";

import React, { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPayment } from "@/app/actions/orders";
import { toast } from "sonner";

export default function ProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    const handleVerification = async () => {
      try {
        const orderId = searchParams.get("orderId");
        const paymentId = searchParams.get("paymentId");
        const signature = searchParams.get("signature");

        if (!orderId || !paymentId || !signature) {
          setVerifying(false);
          setSuccess(false);
          setErrorMessage("Invalid payment information provided");
          return;
        }

        console.log("Verifying payment with:", {
          orderId,
          paymentId,
          signature,
        });

        // Call the server action to verify payment
        const response = await verifyPayment({
          orderId,
          paymentId,
          signature,
        });

        console.log("Verification response:", response);

        if (response.success) {
          setSuccess(true);
          setOrderNumber((response?.orderNumber as string) || "");
          toast.success("Payment verified successfully");

          // Redirect to success page after a delay
          setTimeout(() => {
            router.push(
              response.redirectUrl ||
                `/checkout/success?orderId=${response.orderId}`
            );
          }, 2000);
        } else {
          console.error("Payment verification failed:", response);
          setSuccess(false);
          setErrorMessage(response.message || "Payment verification failed");
          toast.error("Payment verification failed", {
            description: response.message,
          });
        }
      } catch (error: any) {
        console.error("Error during payment verification:", error);
        setSuccess(false);

        // Extract more meaningful error messages
        const errorMsg = error.message || "An unexpected error occurred";
        setErrorMessage(errorMsg);

        toast.error("Payment verification error", {
          description: errorMsg,
        });
      } finally {
        setVerifying(false);
      }
    };

    handleVerification();
  }, [searchParams, router]);

  return (
    <Container>
      <div className="py-16 flex flex-col items-center text-center">
        {verifying ? (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <h1 className="mt-6 text-2xl font-bold">Verifying your payment</h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              Please wait while we verify your payment. This may take a few
              moments...
            </p>
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="mt-6 text-2xl font-bold">Payment Successful!</h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              {orderNumber
                ? `Your order #${orderNumber} has been placed successfully. Redirecting you to the order confirmation page...`
                : "Your payment has been verified successfully. Redirecting to the order confirmation page..."}
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h1 className="mt-6 text-2xl font-bold">
              Payment Verification Failed
            </h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              {errorMessage ||
                "We couldn't verify your payment. Please try again or contact customer support."}
            </p>
            <div className="mt-6 flex gap-4">
              <Button asChild variant="outline">
                <Link href="/cart">Return to Cart</Link>
              </Button>
              <Button asChild>
                <Link href="/checkout">Try Again</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
