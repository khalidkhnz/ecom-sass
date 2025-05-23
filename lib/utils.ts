import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd MMMM yyyy");
}

export function formatPrice(price: number | string, currency = "INR") {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export function getMinimumNumber(arr: string[] | number[]) {
  return arr.reduce((prev, current, idx) => {
    current = typeof current === "string" ? parseFloat(current) : current;
    prev = typeof prev === "string" ? parseFloat(prev) : prev;
    return prev > current ? current : prev;
  });
}
