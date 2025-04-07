"use client";

import { useState, useEffect } from "react";

// This hook manages data in localStorage with type safety
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Use a lazy initial state to avoid recomputing on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Safety check for SSR
      if (typeof window === "undefined") {
        return initialValue;
      }

      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      // Parse stored json or return initialValue
      if (item) {
        console.log(
          `Retrieved from localStorage[${key}]:`,
          item.substring(0, 100) + (item.length > 100 ? "..." : "")
        );

        try {
          // Try to parse the item
          const parsedItem = JSON.parse(item);

          // For cart specifically, validate it has the expected structure
          if (key === "cart") {
            if (!parsedItem.items || !Array.isArray(parsedItem.items)) {
              console.warn(
                "Invalid cart structure in localStorage, resetting to initial value"
              );

              // Store the initial value immediately
              window.localStorage.setItem(key, JSON.stringify(initialValue));
              return initialValue;
            }

            // Ensure cart has totalItems and subtotal properties
            if (
              typeof parsedItem.totalItems !== "number" ||
              typeof parsedItem.subtotal !== "number"
            ) {
              console.warn(
                "Cart missing properties in localStorage, fixing structure"
              );

              // Fix the structure
              const fixedCart = {
                items: parsedItem.items || [],
                totalItems: parsedItem.items
                  ? parsedItem.items.reduce(
                      (sum: number, item: any) => sum + (item.quantity || 0),
                      0
                    )
                  : 0,
                subtotal: 0, // We'll calculate this properly later
              };

              // Store the fixed value immediately
              window.localStorage.setItem(key, JSON.stringify(fixedCart));
              return fixedCart as unknown as T;
            }
          }

          return parsedItem;
        } catch (parseError) {
          console.error(`Error parsing localStorage key "${key}":`, parseError);

          // Store the initial value immediately
          window.localStorage.setItem(key, JSON.stringify(initialValue));
          return initialValue;
        }
      }

      console.log(
        `No existing data in localStorage[${key}], using initial value`
      );

      // Store the initial value immediately
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch (error) {
      // If error, use initial value
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Initialize localStorage on first render if empty
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
    }
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Safety check for SSR
      if (typeof window !== "undefined") {
        // Save to local storage
        const stringified = JSON.stringify(valueToStore);
        console.log(
          `Saving to localStorage[${key}]:`,
          stringified.substring(0, 100) +
            (stringified.length > 100 ? "..." : "")
        );
        window.localStorage.setItem(key, stringified);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
