import slugify from "slugify";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DigitalTransactionStatus } from "./db/digitalTransactions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "...";
}

export function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export const createSlug = (input: string) =>
  slugify(input, { lower: true, strict: true });

// Fungsi untuk mengambil nilai nested dari object berdasarkan path
export function getValueByPath(object: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, object);
}

export function sortArray<T>(
  array: T[],
  key: string,
  order: string | "asc",
): T[] {
  return array.slice().sort((a, b) => {
    const aValue = getValueByPath(a, key);
    const bValue = getValueByPath(b, key);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }
    if (typeof aValue === "string" && typeof bValue === "string") {
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    const aComparable = String(aValue ?? "");
    const bComparable = String(bValue ?? "");
    return order === "asc"
      ? aComparable.localeCompare(bComparable)
      : bComparable.localeCompare(aComparable);
  });
}

type PriceProduct = {
  quantity: number;
  productData?: {
    price?: {
      withDiscount?: number;
      withoutDiscount?: number;
    };
  };
};

export function calculateTotalPrice(products: PriceProduct[]): number {
  return products.reduce((total, product) => {
    // Prioritaskan harga diskon jika ada (dengan pengecekan nilai > 0), jika tidak gunakan harga normal.
    const price = product.productData?.price;
    const unitPrice =
      price?.withDiscount && price.withDiscount > 0
        ? price.withDiscount
        : price?.withoutDiscount ?? 0;

    // Total harga untuk produk ini = unitPrice * quantity produk
    const productTotal = unitPrice * product.quantity;

    return total + productTotal;
  }, 0);
}

export function getBiayaPengiriman(pengiriman: string) {
  switch (pengiriman) {
    case "standard":
      return "1.00";
      break;
    case "same-day":
      return "5.00";
      break;
    case "instant":
      return "8.00";
      break;
    case "reguler":
      return "5.00";
      break;
    default:
      break;
  }
}

const VALID_STATUSES = ["pending", "completed", "failed", "cancelled"] as const;

export function toDigitalTransactionStatus(
  value: unknown,
): DigitalTransactionStatus | undefined {
  if (typeof value === "string" && VALID_STATUSES.includes(value as DigitalTransactionStatus)) {
    return value as DigitalTransactionStatus;
  }
  return undefined;
}
