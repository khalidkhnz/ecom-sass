"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  ShoppingBag,
  CheckCircle,
  ArrowLeft,
  Truck,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/orders";
import { getUserAddresses } from "@/app/actions/addresses";
import { Address } from "@/schema/users";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

// Define interface for the form
interface CheckoutForm {
  shippingAddress: Address;
  billingAddress: Address;
  useShippingAsBilling: boolean;
  paymentMethod: string;
  customerNote: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { cart, isLoading: cartLoading } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [formState, setFormState] = useState<CheckoutForm>({
    shippingAddress: {} as Address,
    billingAddress: {} as Address,
    useShippingAsBilling: true,
    paymentMethod: "razorpay",
    customerNote: "",
  });
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [selectedBillingId, setSelectedBillingId] = useState<string>("");
  const router = useRouter();

  // If user is not logged in, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (status === "authenticated") {
        try {
          const result = await getUserAddresses();
          if (result.addresses && result.addresses.length > 0) {
            setAddresses(result.addresses);
            if (result.defaultAddress) {
              setDefaultAddress(result.defaultAddress);
              setSelectedShippingId(result.defaultAddress.id);
              setSelectedBillingId(result.defaultAddress.id);
              setFormState(
                (prev) =>
                  ({
                    ...prev,
                    shippingAddress: result.defaultAddress,
                    billingAddress: result.defaultAddress,
                  } as CheckoutForm)
              );
            }
          }
        } catch (error) {
          console.error("Failed to fetch addresses:", error);
        } finally {
          setLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();
  }, [status]);

  // Handle shipping address selection
  const handleShippingAddressChange = (addressId: string) => {
    const selected = addresses.find((addr) => addr.id === addressId);
    if (selected) {
      setSelectedShippingId(addressId);
      setFormState((prev) => ({
        ...prev,
        shippingAddress: selected,
        // If using shipping as billing, update billing too
        billingAddress: prev.useShippingAsBilling
          ? selected
          : prev.billingAddress,
      }));
    }
  };

  // Handle billing address selection
  const handleBillingAddressChange = (addressId: string) => {
    const selected = addresses.find((addr) => addr.id === addressId);
    if (selected) {
      setSelectedBillingId(addressId);
      setFormState((prev) => ({
        ...prev,
        billingAddress: selected,
      }));
    }
  };

  // Handle shipping as billing toggle
  const handleUseShippingAsBilling = (checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      useShippingAsBilling: checked,
      billingAddress: checked
        ? prev.shippingAddress
        : addresses.find((addr) => addr.id === selectedBillingId) ||
          ({} as Address),
    }));
  };

  // Handle customer note change
  const handleCustomerNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      customerNote: e.target.value,
    }));
  };

  // Submit the order
  const handleSubmitOrder = async () => {
    if (
      !formState.shippingAddress.id ||
      (!formState.billingAddress.id && !formState.useShippingAsBilling)
    ) {
      toast.error("Missing Information", {
        description: "Please select both shipping and billing addresses",
      });

      return;
    }

    setProcessingOrder(true);

    try {
      const result = await createOrder({
        shippingAddress: formState.shippingAddress,
        billingAddress: formState.useShippingAsBilling
          ? formState.shippingAddress
          : formState.billingAddress,
        useShippingAsBilling: formState.useShippingAsBilling,
        paymentMethod: "razorpay",
        customerNote: formState.customerNote,
      });

      if (result.success) {
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

        const razorpayInstance = (window as any).Razorpay(options);
        razorpayInstance.open();
      } else {
        toast.error("Error", {
          description: result.message || "Failed to create order",
        });
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentResponse: any) => {
    router.push(
      `/checkout/processing?orderId=${paymentResponse.orderId}&paymentId=${paymentResponse.paymentId}&signature=${paymentResponse.signature}`
    );
  };

  // Show loading state
  if (cartLoading || loadingAddresses) {
    return (
      <Container>
        <div className="py-12 flex flex-col items-center">
          <ShoppingBag className="h-16 w-16 text-primary animate-pulse" />
          <h1 className="mt-4 text-2xl font-bold">Loading checkout...</h1>
        </div>
      </Container>
    );
  }

  // Show empty cart message
  if (!cart || cart.items.length === 0) {
    return (
      <Container>
        <div className="py-16 flex flex-col items-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            {`Add some items to your cart to proceed with checkout.`}
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Container>
        <div className="py-10">
          <div className="flex items-center mb-8">
            <Button variant="outline" size="sm" asChild className="mr-4">
              <Link href="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: address and payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Addresses section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="mb-2">No saved addresses found</p>
                      <Button asChild>
                        <Link href="/user/settings/addresses">
                          Add New Address
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shipping-address">
                          Select a shipping address
                        </Label>
                        <Select
                          value={selectedShippingId}
                          onValueChange={handleShippingAddressChange}
                        >
                          <SelectTrigger id="shipping-address">
                            <SelectValue placeholder="Select a shipping address" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                {address.name} - {address.addressLine1},{" "}
                                {address.city}
                                {address.isDefault && " (Default)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedShippingId && (
                        <div className="border rounded-md p-3 bg-muted/20">
                          <p className="font-medium">
                            {formState.shippingAddress.name}
                          </p>
                          <p>{formState.shippingAddress.addressLine1}</p>
                          {formState.shippingAddress.addressLine2 && (
                            <p>{formState.shippingAddress.addressLine2}</p>
                          )}
                          <p>
                            {formState.shippingAddress.city},{" "}
                            {formState.shippingAddress.state}{" "}
                            {formState.shippingAddress.postalCode}
                          </p>
                          <p>{formState.shippingAddress.country}</p>
                          {formState.shippingAddress.phone && (
                            <p className="mt-1">
                              Phone: {formState.shippingAddress.phone}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/user/settings/addresses">
                            Manage Addresses
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="use-shipping-address"
                      checked={formState.useShippingAsBilling}
                      onCheckedChange={handleUseShippingAsBilling}
                    />
                    <Label htmlFor="use-shipping-address">
                      Same as shipping address
                    </Label>
                  </div>

                  {!formState.useShippingAsBilling && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="billing-address">
                          Select a billing address
                        </Label>
                        <Select
                          value={selectedBillingId}
                          onValueChange={handleBillingAddressChange}
                        >
                          <SelectTrigger id="billing-address">
                            <SelectValue placeholder="Select a billing address" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                {address.name} - {address.addressLine1},{" "}
                                {address.city}
                                {address.isDefault && " (Default)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedBillingId && !formState.useShippingAsBilling && (
                        <div className="border rounded-md p-3 bg-muted/20">
                          <p className="font-medium">
                            {formState.billingAddress.name}
                          </p>
                          <p>{formState.billingAddress.addressLine1}</p>
                          {formState.billingAddress.addressLine2 && (
                            <p>{formState.billingAddress.addressLine2}</p>
                          )}
                          <p>
                            {formState.billingAddress.city},{" "}
                            {formState.billingAddress.state}{" "}
                            {formState.billingAddress.postalCode}
                          </p>
                          <p>{formState.billingAddress.country}</p>
                          {formState.billingAddress.phone && (
                            <p className="mt-1">
                              Phone: {formState.billingAddress.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 p-3 border rounded-md bg-primary/5">
                    <Checkbox id="razorpay" checked={true} disabled />
                    <div className="flex flex-1 items-center justify-between">
                      <Label htmlFor="razorpay" className="flex items-center">
                        <img
                          src="https://razorpay.com/assets/razorpay-logo.svg"
                          alt="Razorpay"
                          className="h-6 mr-2"
                        />
                        Pay with Razorpay
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Credit/Debit Cards, UPI, Wallet, and more
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="note">
                      Add a note about your order (optional)
                    </Label>
                    <Input
                      id="note"
                      placeholder="Special instructions for delivery, etc."
                      value={formState.customerNote}
                      onChange={handleCustomerNoteChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: order summary */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items summary */}
                  <div className="space-y-2">
                    {cart.items.map((item) => {
                      // Determine price to use
                      const unitPrice = item.variant?.price
                        ? parseFloat(String(item.variant.price))
                        : item.product?.discountPrice
                        ? parseFloat(String(item.product.discountPrice))
                        : parseFloat(String(item.product?.price || "0"));

                      return (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="flex-1">
                            {item.product?.name}
                            {item.variant && ` (${item.variant.name})`}
                            <span className="text-muted-foreground ml-1">
                              × {item.quantity}
                            </span>
                          </span>
                          <span className="font-medium">
                            {formatPrice(unitPrice * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Price breakdown */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(cart.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>Included</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>

                  {/* Place order button */}
                  <Button
                    className="w-full mt-4"
                    size="lg"
                    disabled={
                      processingOrder ||
                      addresses.length === 0 ||
                      !selectedShippingId ||
                      (!formState.useShippingAsBilling && !selectedBillingId)
                    }
                    onClick={handleSubmitOrder}
                  >
                    {processingOrder ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Place Order
                        <CreditCard className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
