"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Shield,
  Star,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserPaymentPreferences,
  updateUserPaymentPreferences,
  saveUserPaymentMethod,
  deleteUserPaymentMethod,
  setDefaultPaymentMethod,
  type PaymentPreferencesFormValues,
} from "@/app/actions/settings";

export default function PaymentMethodsPage() {
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Payment preferences state
  const [preferences, setPreferences] = useState<PaymentPreferencesFormValues>({
    saveNewMethods: true,
    oneClickCheckout: false,
  });

  // Loading and saving states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for new card form
  const [newCardForm, setNewCardForm] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    saveCard: true,
    makeDefault: false,
  });

  // State to track if we're adding a new card
  const [addingNewCard, setAddingNewCard] = useState(false);

  // Load user payment data on page load
  useEffect(() => {
    async function loadPaymentData() {
      try {
        const result: any = await getUserPaymentPreferences();
        if (result.success) {
          setPaymentMethods(result?.paymentMethods);
          setPreferences(result?.preferences);
        } else {
          toast.error("Failed to load payment data", {
            description: result.error || "Please try again later",
          });
        }
      } catch (error) {
        console.error("Error loading payment data:", error);
        toast.error("Error loading payment data", {
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPaymentData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewCardForm({
      ...newCardForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle setting a card as default
  const handleSetDefault = async (id: string) => {
    try {
      setIsSaving(true);
      const result = await setDefaultPaymentMethod(id);

      if (result.success) {
        setPaymentMethods(
          paymentMethods.map((method) => ({
            ...method,
            isDefault: method.id === id,
          }))
        );
        toast.success("Default payment method updated");
      } else {
        toast.error("Failed to update default payment method", {
          description: result.error || "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error updating default payment method:", error);
      toast.error("Error updating payment method", {
        description: "Please try again later",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting a payment method
  const handleDeleteCard = async (id: string) => {
    try {
      setIsSaving(true);
      const result = await deleteUserPaymentMethod(id);

      if (result.success) {
        // If the deleted card was the default, update the UI to reflect the new default
        const wasDefault = paymentMethods.find((m) => m.id === id)?.isDefault;
        let updatedMethods = paymentMethods.filter(
          (method) => method.id !== id
        );

        // If the deleted method was the default and there are other methods, make the first one default
        if (wasDefault && updatedMethods.length > 0) {
          updatedMethods = updatedMethods.map((method, index) => ({
            ...method,
            isDefault: index === 0,
          }));
        }

        setPaymentMethods(updatedMethods);
        toast.success("Payment method removed");
      } else {
        toast.error("Failed to remove payment method", {
          description: result.error || "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast.error("Error removing payment method", {
        description: "Please try again later",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding a new card
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // In a real app, you would validate and process the card details here
      // Usually involving a payment processor like Stripe, Braintree, etc.

      // Mock addition of a new card
      const newCard = {
        id: `card${Date.now()}`,
        type: newCardForm.cardNumber.startsWith("4") ? "visa" : "mastercard",
        last4: newCardForm.cardNumber.slice(-4),
        expiryMonth: newCardForm.expiryMonth,
        expiryYear: newCardForm.expiryYear,
        nameOnCard: newCardForm.cardholderName,
        isDefault: newCardForm.makeDefault || paymentMethods.length === 0,
      };

      const result = await saveUserPaymentMethod(newCard);

      if (result.success) {
        // If making default, update all other cards in the UI
        let updatedMethods = [...paymentMethods];
        if (newCard.isDefault) {
          updatedMethods = updatedMethods.map((card) => ({
            ...card,
            isDefault: false,
          }));
        }

        setPaymentMethods([...updatedMethods, newCard]);
        setAddingNewCard(false);
        setNewCardForm({
          cardNumber: "",
          cardholderName: "",
          expiryMonth: "",
          expiryYear: "",
          cvv: "",
          saveCard: true,
          makeDefault: false,
        });

        toast.success("New payment method added");
      } else {
        toast.error("Failed to add payment method", {
          description: result.error || "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Error adding payment method", {
        description: "Please try again later",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle preference changes
  const handlePreferenceChange = (
    preference: keyof PaymentPreferencesFormValues
  ) => {
    setPreferences({
      ...preferences,
      [preference]: !preferences[preference],
    });
  };

  // Save preferences
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserPaymentPreferences(preferences);

      if (result.success) {
        toast.success("Payment preferences saved successfully");
      } else {
        toast.error("Failed to save payment preferences", {
          description: (result?.error as string) || "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error saving payment preferences:", error);
      toast.error("Error saving preferences", {
        description: "Please try again later",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Render card icon based on type
  const getCardIcon = (type: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  // Format card type name
  const formatCardType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Methods</h1>
        <p className="text-muted-foreground mt-2">
          Manage your payment options for faster checkout
        </p>
      </div>

      {/* Saved Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saved Payment Methods
          </CardTitle>
          <CardDescription>
            Your stored payment methods for faster checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                You haven&apos;t saved any payment methods yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-md relative"
                >
                  {method.isDefault && (
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" /> Default
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    {getCardIcon(method.type)}
                    <div>
                      <p className="font-medium">
                        {formatCardType(method.type)} •••• {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={isSaving}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCard(method.id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setAddingNewCard(true)}
            disabled={isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardFooter>
      </Card>

      {/* Add New Card Form */}
      {addingNewCard && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
            <CardDescription>Enter your card details securely</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  placeholder="Name as it appears on card"
                  value={newCardForm.cardholderName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={newCardForm.cardNumber}
                    onChange={handleInputChange}
                    maxLength={19}
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Input
                    id="expiryMonth"
                    name="expiryMonth"
                    placeholder="MM"
                    value={newCardForm.expiryMonth}
                    onChange={handleInputChange}
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Input
                    id="expiryYear"
                    name="expiryYear"
                    placeholder="YY"
                    value={newCardForm.expiryYear}
                    onChange={handleInputChange}
                    maxLength={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      name="cvv"
                      type="password"
                      placeholder="123"
                      value={newCardForm.cvv}
                      onChange={handleInputChange}
                      maxLength={4}
                      required
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="saveCard">Save this card</Label>
                    <p className="text-sm text-muted-foreground">
                      Securely store this card for future purchases
                    </p>
                  </div>
                  <Switch
                    id="saveCard"
                    name="saveCard"
                    checked={newCardForm.saveCard}
                    onCheckedChange={(checked) =>
                      setNewCardForm({ ...newCardForm, saveCard: checked })
                    }
                  />
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="makeDefault">
                      Make default payment method
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use this card as your default payment method
                    </p>
                  </div>
                  <Switch
                    id="makeDefault"
                    name="makeDefault"
                    checked={newCardForm.makeDefault}
                    onCheckedChange={(checked) =>
                      setNewCardForm({ ...newCardForm, makeDefault: checked })
                    }
                  />
                </div>
              </div>

              <div className="text-sm p-3 bg-muted/20 rounded-md flex items-start gap-2 mt-4">
                <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Your payment information is encrypted and securely stored. We
                  never store your CVV code.
                </p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setAddingNewCard(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCard} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Payment Method"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Payment Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Preferences
          </CardTitle>
          <CardDescription>
            Configure how you pay and manage your transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="save-cards">Save Payment Methods</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save new payment methods for future use
              </p>
            </div>
            <Switch
              id="save-cards"
              checked={preferences.saveNewMethods}
              onCheckedChange={() => handlePreferenceChange("saveNewMethods")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="one-click">One-Click Checkout</Label>
              <p className="text-sm text-muted-foreground">
                Skip payment confirmation for faster checkout with default
                payment method
              </p>
            </div>
            <Switch
              id="one-click"
              checked={preferences.oneClickCheckout}
              onCheckedChange={() => handlePreferenceChange("oneClickCheckout")}
            />
          </div>

          <div className="text-sm p-3 bg-muted/20 rounded-md flex items-start gap-2 mt-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              One-click checkout allows for faster purchases but bypasses the
              payment confirmation step. Enable with caution.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={savePreferences} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
