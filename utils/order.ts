import type { OrderStatus } from "@/types/order";

export function parseShippingAddress(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const ORDER_STATUS_STEPS = [
  { key: "pending", label: "Dibuat", icon: "🛍️" },
  { key: "paid", label: "Dibayar", icon: "✅" },
  { key: "shipped", label: "Dikirim", icon: "🚚" },
  { key: "delivered", label: "Tiba", icon: "📦" },
] as const;

export function getStepIndex(status: OrderStatus) {
  const map: Record<OrderStatus, number> = {
    pending: 0,
    paid: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };
  return map[status];
}

export function getStatusLabel(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending: "Menunggu Pembayaran",
    paid: "Dibayar",
    shipped: "Dikirim",
    delivered: "Selesai",
    cancelled: "Dibatalkan",
  };
  return map[status];
}

export function getStatusColor(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return map[status];
}
