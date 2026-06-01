import Image from "next/image";
import Link from "next/link";
import type { OrderItem } from "@/types/order";
import type { OrderStatus } from "@/types/order";
import { formatCurrency } from "@/utils/order";
import { createSlug } from "@/lib/utils";

type Props = {
  item: OrderItem;
  status: OrderStatus;
  currency: string;
};

export function OrderItemCard({ item, status, currency }: Props) {
  const slug = createSlug(item.product_title);

  return (
    <div className="flex items-start gap-4 py-4">
      {/* Product image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.product_title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            📦
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {item.product_title}
        </p>
        {item.variant && (
          <p className="mt-0.5 text-xs text-gray-500">
            Variant: {item.variant}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formatCurrency(item.price, currency)} × {item.quantity}
        </p>
      </div>

      {/* Subtotal + actions */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(item.subtotal, currency)}
        </p>
        <Link
          href={`/product/${item.product_id}/${slug}`}
          className="text-xs text-green-600 hover:underline"
        >
          Beli Lagi
        </Link>
      </div>
    </div>
  );
}
