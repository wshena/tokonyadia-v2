import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getOrderById } from "@/lib/db/order";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { OrderItemCard } from "@/components/orders/OrderItemCard";
import { OrderDetailActions } from "@/components/orders/OrderDetailActions";
import {
  parseShippingAddress,
  formatCurrency,
  getStatusLabel,
  getStatusColor,
} from "@/utils/order";
import type { OrderStatus } from "@/types/order";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id: orderId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let order;
  try {
    order = await getOrderById(supabase, orderId);
  } catch {
    notFound();
  }

  if (order.user_id !== user.id) notFound();

  const status = order.status as OrderStatus;
  const shippingAddr = parseShippingAddress(order.shipping_address);
  const createdAt = format(new Date(order.created_at), "dd MMMM yyyy, HH:mm", {
    locale: id,
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-6 md:px-8 pt-15 md:pt-25">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Back + Header */}
        <div>
          <Link
            href="/order"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeftIcon size={16} />
            Kembali ke Pesanan Saya
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Pesanan #{orderId.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">{createdAt}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(status)}`}
            >
              {getStatusLabel(status)}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <OrderStatusTimeline status={status} />

        {/* Product Items */}
        <div className="rounded-xl border border-gray-100 bg-white px-6">
          <h2 className="pt-4 text-sm font-semibold text-gray-700">
            Produk Dipesan
          </h2>
          <div className="divide-y divide-gray-50">
            {order.order_items.map((item: any) => (
              <OrderItemCard
                key={item.id}
                item={item}
                status={status}
                currency={order.currency}
              />
            ))}
          </div>
        </div>

        {/* Shipping + Payment info */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Alamat */}
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Alamat Pengiriman
            </h2>
            {shippingAddr ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{shippingAddr.name}</p>
                <p>{shippingAddr.phone}</p>
                <p>{shippingAddr.street}</p>
                <p>
                  {shippingAddr.city}, {shippingAddr.province}{" "}
                  {shippingAddr.postal_code}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">{order.shipping_address}</p>
            )}
            {order.delivery_method && (
              <div className="mt-3 border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-500">Metode Pengiriman</p>
                <p className="text-sm font-medium text-gray-800">
                  {order.delivery_method}
                </p>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Ringkasan Pembayaran
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.total_price, order.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.total_price, order.currency)}</span>
              </div>
            </div>
            {order.payment_method && (
              <div className="mt-3 border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-500">Metode Pembayaran</p>
                <p className="text-sm font-medium text-gray-800">
                  {order.payment_method}
                </p>
              </div>
            )}
            {order.notes && (
              <div className="mt-3 border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-500">Catatan</p>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <OrderDetailActions orderId={orderId} status={status} />
      </div>
    </main>
  );
}
