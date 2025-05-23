"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/cart-context";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeContextProvider } from "./theme-context";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <NuqsAdapter>
      <SessionProvider>
        <CartProvider>
          <ThemeContextProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <QueryClientProvider client={queryClient}>
                {children}
                {process.env.NODE_ENV === "development" && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
              </QueryClientProvider>
            </ThemeProvider>
          </ThemeContextProvider>
        </CartProvider>
      </SessionProvider>
    </NuqsAdapter>
  );
}
