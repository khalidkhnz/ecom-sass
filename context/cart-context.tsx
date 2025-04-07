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
  getLocalCartItemDetails,
} from "@/app/actions/cart";
import { Cart } from "@/schema/cart";
import { useSession } from "next-auth/react";
import { useLocalStorage } from "@/hooks/use-local-storage";

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

// Empty cart structure
const emptyCart: Cart = { items: [], totalItems: 0, subtotal: 0 };

// Create context with default values
const CartContext = createContext<CartContextType | undefined>(undefined);

// The provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user?.id;

  // Use the localStorage hook for guest users
  const [localCart, setLocalCart] = useLocalStorage<Cart>("cart", emptyCart);

  // Function to fetch the cart data
  const refreshCart = async () => {
    try {
      setIsLoading(true);

      if (isAuthenticated) {
        // Get cart from database for authenticated users
        const cartData = await getCart();
        console.log("Authenticated user cart from server:", cartData);
        setCart(cartData);
      } else {
        // Use localStorage cart for guest users
        console.log("Guest user local cart:", localCart);

        // If local cart has items, we need to fetch product details
        if (localCart.items && localCart.items.length > 0) {
          try {
            console.log(
              "Client: Guest user has items in cart, fetching product details"
            );

            // Extract the product IDs and variant IDs from the local cart
            const productIds = localCart.items.map((item) => item.productId);
            console.log("Product IDs to fetch:", productIds);

            // Get product details directly
            const productDetails = await getLocalCartItemDetails(
              localCart.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
              }))
            );

            console.log("Product details fetched:", productDetails);

            if (!productDetails) {
              console.error("Failed to fetch product details");
              setCart(localCart);
              return;
            }

            // Update local cart items with the fetched product details
            const updatedItems = localCart.items.map((item, index) => {
              if (index < productDetails.length && productDetails[index]) {
                return {
                  ...item,
                  product: {
                    ...productDetails[index].product,
                    // Ensure images is always an array
                    images: productDetails[index].product.images || [],
                  },
                  variant: productDetails[index].variant,
                };
              }
              return item;
            });

            console.log(
              "Updated cart items with product details:",
              updatedItems
            );

            // Calculate subtotal
            const subtotal = updatedItems.reduce((sum, item) => {
              let price = 0;
              if (item.variant?.price) {
                price = parseFloat(String(item.variant.price));
              } else if (item.product.discountPrice) {
                price = parseFloat(String(item.product.discountPrice));
              } else {
                price = parseFloat(String(item.product.price));
              }
              return sum + price * item.quantity;
            }, 0);

            // Create the updated cart object
            const updatedCart = {
              items: updatedItems,
              totalItems: localCart.totalItems,
              subtotal,
            };

            console.log("Setting updated cart for guest user:", updatedCart);
            setCart(updatedCart);
          } catch (error) {
            console.error("Error updating cart with product details:", error);
            // Fallback to local cart if there's an error
            setCart(localCart);
          }
        } else {
          console.log("Guest user has no items in cart");
          setCart(emptyCart);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCart(isAuthenticated ? null : emptyCart);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize cart on page load
  useEffect(() => {
    if (status !== "loading") {
      refreshCart();
    }
  }, [status]);

  // Sync cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      syncCartOnLogin().then(() => refreshCart());
    }
  }, [isAuthenticated]);

  // Make sure we load the cart from localStorage immediately when it changes
  // This helps ensure we have a correct cart state from the beginning
  useEffect(() => {
    if (!isAuthenticated && localCart) {
      console.log("Initial load of local cart:", localCart);

      // Use localCart as a fallback until we can refresh with product details
      if (!cart && localCart.items && localCart.items.length > 0) {
        console.log("Setting initial cart state from localStorage");
        setCart(localCart);
      }

      // Then refresh to get full product details
      refreshCart();
    }
  }, [localCart, isAuthenticated]);

  // Add item to cart
  const addItem = async (
    productId: string,
    quantity = 1,
    variantId?: string
  ) => {
    try {
      console.log(
        `Adding item: ${productId}, quantity: ${quantity}, variant: ${
          variantId || "none"
        }`
      );

      if (isAuthenticated) {
        // Add to database for authenticated users
        await addToCart({ productId, quantity, variantId });
      } else {
        // Get product details first for a better user experience
        const productDetails = await getLocalCartItemDetails([
          { productId, variantId: variantId || null },
        ]);

        console.log("Product details for new item:", productDetails);

        // Add to localStorage for guest users
        const existingItemIndex = localCart.items.findIndex(
          (item) =>
            item.productId === productId &&
            ((!item.variantId && !variantId) || item.variantId === variantId)
        );

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          console.log("Item already exists in cart, updating quantity");
          const updatedItems = [...localCart.items];
          updatedItems[existingItemIndex].quantity += quantity;

          setLocalCart({
            ...localCart,
            items: updatedItems,
            totalItems: updatedItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
          });
        } else {
          // Add new item with product details already fetched
          console.log("Adding new item to cart");
          const productDetail = productDetails[0];

          const newItem = {
            id: Date.now().toString(), // Generate temporary ID
            cartId: "local",
            productId,
            variantId: variantId || null,
            quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: productDetail
              ? {
                  ...productDetail.product,
                  // Ensure images is always an array
                  images: Array.isArray(productDetail.product.images)
                    ? productDetail.product.images
                    : [],
                }
              : {
                  id: productId,
                  name: "Loading...",
                  price: "0",
                  discountPrice: null,
                  images: [],
                  slug: "",
                },
            variant: productDetail ? productDetail.variant : null,
          };

          const newCart = {
            ...localCart,
            items: [...localCart.items, newItem],
            totalItems: localCart.totalItems + quantity,
          };

          console.log("Setting updated local cart:", newCart);
          setLocalCart(newCart);
        }
      }

      // Always refresh the cart after modifications to ensure we have the latest data
      await refreshCart();
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      throw error;
    }
  };

  // Update item quantity
  const updateItem = async (itemId: string, quantity: number) => {
    try {
      console.log(`Updating item ${itemId} with quantity ${quantity}`);

      if (isAuthenticated) {
        // Update in database for authenticated users
        await updateCartItem({ itemId, quantity });
      } else {
        // Update in localStorage for guest users
        const itemIndex = localCart.items.findIndex(
          (item) => item.id === itemId
        );

        if (itemIndex === -1) {
          console.error("Item not found in cart:", itemId);
          return;
        }

        console.log("Found item to update:", localCart.items[itemIndex]);

        const updatedItems = [...localCart.items];
        updatedItems[itemIndex].quantity = quantity;

        const newCart = {
          ...localCart,
          items: updatedItems,
          totalItems: updatedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
        };

        console.log(
          "Setting updated local cart after quantity change:",
          newCart
        );
        setLocalCart(newCart);
      }

      // Always refresh the cart after modifications
      await refreshCart();
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    try {
      console.log(`Removing item ${itemId} from cart`);

      if (isAuthenticated) {
        // Remove from database for authenticated users
        await removeCartItem({ itemId });
      } else {
        // Find the item first for logging
        const itemToRemove = localCart.items.find((item) => item.id === itemId);
        console.log("Removing item from cart:", itemToRemove);

        // Remove from localStorage for guest users
        const updatedItems = localCart.items.filter(
          (item) => item.id !== itemId
        );

        const newCart = {
          ...localCart,
          items: updatedItems,
          totalItems: updatedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
        };

        console.log("Setting updated local cart after item removal:", newCart);
        setLocalCart(newCart);
      }

      // Always refresh the cart after modifications
      await refreshCart();
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      throw error;
    }
  };

  // Clear entire cart
  const clearItems = async () => {
    try {
      if (isAuthenticated) {
        // Clear database cart for authenticated users
        await clearCart();
      } else {
        // Clear localStorage cart for guest users
        setLocalCart(emptyCart);
      }

      // Refresh cart after clearing
      await refreshCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  };

  // Function to sync localStorage cart to server when user logs in
  const syncCartOnLogin = async () => {
    if (!isAuthenticated || !localCart.items.length) return;

    try {
      // Add each item from localStorage to the user's cart in database
      for (const item of localCart.items) {
        await addToCart({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
        });
      }

      // Clear localStorage cart after syncing
      setLocalCart(emptyCart);
    } catch (error) {
      console.error("Failed to sync cart on login:", error);
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
