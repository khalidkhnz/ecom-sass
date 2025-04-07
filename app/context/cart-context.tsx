"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/app/actions/cart";
import { Cart } from "@/schema/cart";

// Define the context type
interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (
    productId: string,
    quantity?: number,
    variantId?: string
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearItems: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Create context with default values
const CartContext = createContext<CartContextType | undefined>(undefined);

// The provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch the cart data
  const refreshCart = async () => {
    try {
      setIsLoading(true);
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize cart on page load
  useEffect(() => {
    refreshCart();
  }, []);

  // Add item to cart
  const addItem = async (
    productId: string,
    quantity = 1,
    variantId?: string
  ) => {
    try {
      await addToCart({ productId, quantity, variantId });
      await refreshCart();
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      throw error;
    }
  };

  // Update item quantity
  const updateItem = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem({ itemId, quantity });
      await refreshCart();
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    try {
      await removeCartItem({ itemId });
      await refreshCart();
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      throw error;
    }
  };

  // Clear entire cart
  const clearItems = async () => {
    try {
      await clearCart();
      await refreshCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  };

  // Context value
  const value = {
    cart,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
