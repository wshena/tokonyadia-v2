import type { SupabaseClient } from "@supabase/supabase-js";

type InsertNotificationParams = {
  userId: string;
  type: "order_update" | "restock" | "flash_sale" | "promo";
  title: string;
  message: string;
  link?: string;
};

export async function insertNotification(
  supabase: SupabaseClient,
  params: InsertNotificationParams,
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
    is_read: false,
  });

  // Gagal insert notifikasi tidak boleh crash main flow
  if (error) console.error("[insertNotification] error:", error.message);
}

// Map status order ke pesan yang user-friendly
export function getOrderStatusNotification(
  orderId: string,
  status: string,
): { title: string; message: string } {
  const map: Record<string, { title: string; message: string }> = {
    pending: {
      title: "⏳ Pesanan Menunggu Pembayaran",
      message: "Pesanan kamu sedang menunggu konfirmasi pembayaran.",
    },
    paid: {
      title: "✅ Pembayaran Dikonfirmasi",
      message: "Pembayaran kamu telah dikonfirmasi. Pesanan sedang diproses.",
    },
    shipped: {
      title: "🚚 Pesanan Dikirim",
      message: "Pesanan kamu sedang dalam perjalanan ke alamat tujuan.",
    },
    delivered: {
      title: "📦 Pesanan Tiba",
      message: "Pesanan kamu telah tiba. Jangan lupa berikan ulasan!",
    },
    cancelled: {
      title: "❌ Pesanan Dibatalkan",
      message: "Pesanan kamu telah dibatalkan.",
    },
  };

  return (
    map[status] ?? {
      title: "Update Pesanan",
      message: `Status pesanan kamu telah diperbarui menjadi ${status}.`,
    }
  );
}
