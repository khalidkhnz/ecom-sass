"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getUserAddresses,
  deleteAddress,
  setDefaultAddress,
} from "@/app/actions/addresses";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  Edit,
  Loader2,
  Home,
  Building,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Address } from "@/schema/users";
import AddressForm from "./address-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAddresses() {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/signin");
        return;
      }

      try {
        setLoading(true);
        const result = await getUserAddresses();

        if (result.error) {
          toast.error(result.error);
        } else {
          setAddresses(result.addresses || []);
        }
      } catch (error) {
        console.error("Error loading addresses:", error);
        toast.error("Failed to load addresses");
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, [status, router]);

  const handleAddressAdded = (newAddress: Address) => {
    setAddresses((prev) => [...prev, newAddress]);
    setShowAddForm(false);
    toast.success("Address added successfully");
  };

  const handleAddressUpdated = (updatedAddress: Address) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === updatedAddress.id ? updatedAddress : addr
      )
    );
    setEditAddress(null);
    toast.success("Address updated successfully");
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setProcessingId(addressId);
      const result = await deleteAddress({ addressId });

      if (result.success) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setProcessingId(addressId);
      const result = await setDefaultAddress({ addressId });

      if (result.success) {
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr.id === addressId,
          }))
        );
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Shipping Addresses
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your shipping addresses for faster checkout
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/user/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </div>

      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Address</CardTitle>
            <CardDescription>
              Enter the details for your new shipping address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressForm
              onSuccess={handleAddressAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      ) : editAddress ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Address</CardTitle>
            <CardDescription>
              Update your shipping address details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressForm
              address={editAddress}
              onSuccess={handleAddressUpdated}
              onCancel={() => setEditAddress(null)}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No addresses found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You haven&apos;t added any shipping addresses yet.
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <Card
                  key={address.id}
                  className={`relative ${
                    address.isDefault ? "border-primary" : ""
                  }`}
                >
                  {address.isDefault && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className="bg-primary text-primary-foreground"
                      >
                        <Check className="mr-1 h-3 w-3" /> Default
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {address.name}
                    </CardTitle>
                    <CardDescription>
                      {address.phone && <div>{address.phone}</div>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <div>{address.addressLine1}</div>
                      {address.addressLine2 && (
                        <div>{address.addressLine2}</div>
                      )}
                      <div>
                        {address.city}, {address.state} {address.postalCode}
                      </div>
                      <div>{address.country}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditAddress(address)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Address</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this address? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              {processingId === address.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {!address.isDefault && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={processingId === address.id}
                      >
                        {processingId === address.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Set as Default
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
