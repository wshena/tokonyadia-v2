"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/types/order";

type Props = {
  orderId: string;
  status: OrderStatus;
};

export function OrderDetailActions({ orderId, status }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (nextStatus: string) => {
    setIsLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setIsLoading(false);
    router.refresh();
  };

  if (status === "pending") {
    return (
      <button
        onClick={() => updateStatus("cancelled")}
        disabled={isLoading}
        className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {isLoading ? "Memproses..." : "Batalkan Pesanan"}
      </button>
    );
  }

  if (status === "shipped") {
    return (
      <button
        onClick={() => updateStatus("delivered")}
        disabled={isLoading}
        className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? "Memproses..." : "✅ Konfirmasi Pesanan Diterima"}
      </button>
    );
  }

  return null;
}
