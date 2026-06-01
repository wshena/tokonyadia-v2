"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ContentContainer from "@/components/ui/layouts/ContentContainer";
import ReviewComposerModal from "@/components/reviews/ReviewComposerModal";
import CancelOrderModal from "@/components/ui/modals/CancelOrderModal";
import DeleteOrderModal from "@/components/ui/modals/DeleteOrderModal";
import { useAuthStore } from "@/lib/zustand/authStore";
import { cn, createSlug } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useUtilityStore } from "@/lib/zustand/utilityStore";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

type OrderItem = {
  id: string;
  product_id: string;
  product_title: string;
  variant: string;
  quantity: number;
  price: number;
  subtotal: number;
  image: string;
};

type Order = {
  id: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  total_price: number;
  currency: string;
  shipping_address: string;
  payment_method: string;
  delivery_method: string;
  notes?: string;
  order_items?: OrderItem[];
};

type ProductReview = {
  id: string;
  product_id: string;
  order_id: string;
  order_item_id: string;
  status: "pending" | "approved" | "rejected";
  rate: number;
  comment: string;
  updated_at?: string;
};

const supabase = createClient();

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string; description: string }
> = {
  pending: {
    label: "Menunggu Pembayaran",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    description:
      "Pesanan siap dibayar dan akan diproses setelah pembayaran berhasil.",
  },
  paid: {
    label: "Sudah Dibayar",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    description:
      "Pembayaran sudah diterima. Sistem sedang menyiapkan pengiriman.",
  },
  shipped: {
    label: "Sedang Dikirim",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    description: "Kurir sedang menuju alamat tujuan.",
  },
  delivered: {
    label: "Selesai",
    className: "border-green-200 bg-green-50 text-green-700",
    description: "Pesanan sudah sampai ke alamat tujuan.",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    description: "Pesanan ini tidak akan diproses lebih lanjut.",
  },
};

const paymentLabelMap: Record<string, string> = {
  brivia: "BRI Virtual Account",
  bcava: "BCA Virtual Account",
  mandiriva: "Mandiri Virtual Account",
  bni: "BNI Virtual Account",
  qris: "QRIS",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  cod: "Cash on Delivery",
  bank_transfer: "Transfer Bank",
};

const deliveryLabelMap: Record<string, string> = {
  standard: "Standard Delivery",
  instant: "Instant Courier",
  "same-day": "Same Day Delivery",
};

const formatCurrency = (currency: string, amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const OrderPage = () => {
  const router = useRouter();
  const setAlert = useUtilityStore((state) => state.setAlert);
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [modalType, setModalType] = useState<
    "cancel" | "delete" | "bulk-cancel" | "bulk-delete" | null
  >(null);
  const [reviewMap, setReviewMap] = useState<Record<string, ProductReview>>({});
  const [reviewDraft, setReviewDraft] = useState<{
    orderId: string;
    item: OrderItem;
  } | null>(null);

  const fetchOrders = useCallback(
    async (keepLoading = false) => {
      if (!keepLoading) setLoading(true);

      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message ?? "Gagal memuat pesanan");
        }

        setOrders(payload.data ?? []);
      } catch (error: unknown) {
        setAlert({
          label:
            error instanceof Error ? error.message : "Gagal memuat pesanan",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [setAlert],
  );

  useEffect(() => {
    fetchOrders();

    let mounted = true;
    let pollInterval: NodeJS.Timeout | undefined;
    let refreshOnFocus: (() => void) | undefined;
    let orderChannel: ReturnType<typeof supabase.channel> | undefined;
    let orderItemsChannel: ReturnType<typeof supabase.channel> | undefined;

    const setupRealtime = async () => {
      if (!mounted) return () => undefined;

      const userId = user?.id;
      const channelSuffix = `${userId ?? "guest"}-${Date.now()}`;

      orderChannel = supabase
        .channel(`orders-live-${channelSuffix}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            ...(userId ? { filter: `user_id=eq.${userId}` } : {}),
          },
          () => {
            if (mounted) fetchOrders(true);
          },
        )
        .subscribe();

      orderItemsChannel = supabase
        .channel(`order-items-live-${channelSuffix}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "order_items",
          },
          () => {
            if (mounted) fetchOrders(true);
          },
        )
        .subscribe();

      pollInterval = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchOrders(true);
        }
      }, 15000);

      refreshOnFocus = () => fetchOrders(true);
      window.addEventListener("focus", refreshOnFocus);
      document.addEventListener("visibilitychange", refreshOnFocus);

      return () => {
        mounted = false;
        if (pollInterval) clearInterval(pollInterval);
        if (refreshOnFocus) {
          window.removeEventListener("focus", refreshOnFocus);
          document.removeEventListener("visibilitychange", refreshOnFocus);
        }
        if (orderChannel) supabase.removeChannel(orderChannel);
        if (orderItemsChannel) supabase.removeChannel(orderItemsChannel);
      };
    };

    let cleanup: undefined | (() => void);
    setupRealtime().then((fn) => {
      if (mounted) {
        cleanup = fn;
      } else {
        fn?.();
      }
    });

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (refreshOnFocus) {
        window.removeEventListener("focus", refreshOnFocus);
        document.removeEventListener("visibilitychange", refreshOnFocus);
      }
      if (orderChannel) supabase.removeChannel(orderChannel);
      if (orderItemsChannel) supabase.removeChannel(orderItemsChannel);
      cleanup?.();
    };
  }, [fetchOrders, user]);

  useEffect(() => {
    const deliveredProductIds = Array.from(
      new Set(
        orders
          .filter((order) => order.status === "delivered")
          .flatMap((order) => order.order_items ?? [])
          .map((item) => item.product_id)
          .filter(Boolean),
      ),
    );

    if (!deliveredProductIds.length) {
      setReviewMap({});
      return;
    }

    const fetchMyReviews = async () => {
      try {
        const params = new URLSearchParams({
          mine: "true",
          productIds: deliveredProductIds.join(","),
        });
        const response = await fetch(`/api/reviews?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message ?? "Gagal memuat review anda");
        }

        const nextReviewMap = (payload.data ?? []).reduce(
          (acc: Record<string, ProductReview>, review: ProductReview) => {
            acc[review.product_id] = review;
            return acc;
          },
          {},
        );

        setReviewMap(nextReviewMap);
      } catch (error: unknown) {
        setAlert({
          label:
            error instanceof Error ? error.message : "Gagal memuat review anda",
          type: "error",
        });
      }
    };

    fetchMyReviews();
  }, [orders, setAlert]);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [orders],
  );

  const summary = useMemo(() => {
    const totalItems = orders.reduce((sum, order) => {
      return (
        sum +
        (order.order_items ?? []).reduce(
          (itemSum, item) => itemSum + item.quantity,
          0,
        )
      );
    }, 0);

    return {
      totalOrders: orders.length,
      totalItems,
      pendingOrders: orders.filter((order) => order.status === "pending")
        .length,
      totalSpent: orders.reduce((sum, order) => sum + order.total_price, 0),
    };
  }, [orders]);

  const closeModal = () => {
    setModalType(null);
    setSelectedOrderId(null);
    setIsProcessing(false);
  };

  const closeReviewModal = () => {
    setReviewDraft(null);
  };

  const toggleOrderSelection = (orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.status !== "pending") return;

    setSelectedOrders((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const selectAllPending = () => {
    setSelectedOrders(
      new Set(
        orders
          .filter((order) => order.status === "pending")
          .map((order) => order.id),
      ),
    );
  };

  const deselectAll = () => setSelectedOrders(new Set());

  const runOrderAction = async (
    method: "PATCH" | "DELETE",
    ids: string[],
    successLabel: string,
    body?: Record<string, string>,
  ) => {
    setIsProcessing(true);

    try {
      await Promise.all(
        ids.map(async (orderId) => {
          const response = await fetch(`/api/orders/${orderId}`, {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined,
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(
              payload?.message ?? `Gagal memproses order ${orderId}`,
            );
          }
        }),
      );

      setAlert({ label: successLabel, type: "success" });
      closeModal();
      deselectAll();
      fetchOrders(true);
    } catch (error: unknown) {
      setAlert({
        label:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memproses order",
        type: "error",
      });
      setIsProcessing(false);
    }
  };

  const submitReview = async ({
    rate,
    comment,
  }: {
    rate: number;
    comment: string;
  }) => {
    if (!reviewDraft) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: reviewDraft.item.product_id,
          order_id: reviewDraft.orderId,
          order_item_id: reviewDraft.item.id,
          rate,
          comment,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal menyimpan review");
      }

      const review = payload.data as ProductReview;

      setReviewMap((current) => ({
        ...current,
        [review.product_id]: review,
      }));

      setAlert({
        label: payload?.message ?? "Review berhasil disimpan",
        type: "success",
      });
      closeReviewModal();
    } catch (error: unknown) {
      setAlert({
        label:
          error instanceof Error ? error.message : "Gagal menyimpan review",
        type: "error",
      });
    }
  };

  const proceedToPayment = () => {
    const pendingIds = Array.from(selectedOrders).filter((orderId) => {
      const order = orders.find((item) => item.id === orderId);
      return order?.status === "pending";
    });

    if (pendingIds.length === 0) {
      setAlert({
        label: "Pilih minimal satu order dengan status pending.",
        type: "warning",
      });
      return;
    }

    router.push(`/payment?orders=${pendingIds.join(",")}`);
  };

  if (loading) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
              <p className="mt-4 text-gray-600">Memuat pesanan...</p>
            </div>
          </div>
        </ContentContainer>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <section className="rounded-[28px] border border-gray-200 bg-white px-6 py-10 text-center shadow-sm md:px-10">
            <div className="mx-auto relative h-40 w-40">
              <Image
                src="/image/3-emptystate.png"
                alt="Belum ada pesanan"
                fill
                sizes="220px"
                className="object-contain"
              />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Belum ada pesanan
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600 md:text-base">
              Order baru akan muncul di halaman ini setelah checkout selesai.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex cursor-pointer rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700"
              >
                Mulai Belanja
              </Link>
              <Link
                href="/wishlist"
                className="inline-flex cursor-pointer rounded-lg border border-green-500 px-5 py-3 font-medium text-green-700 transition-colors hover:bg-green-50"
              >
                Lihat Wishlist
              </Link>
            </div>
          </section>
        </ContentContainer>
      </main>
    );
  }

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-8">
          <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="bg-linear-to-r from-green-600 via-emerald-500 to-lime-400 px-6 py-8 text-white md:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    Pusat Pesanan
                  </span>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold md:text-4xl">
                      Lihat semua pesanan yang anda buat
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-white/90 md:text-base">
                      Pantau status pesanan, lacak pengiriman, dan kelola
                      pesanan Anda dengan mudah di sini.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/cart"
                    className="inline-flex cursor-pointer rounded-lg bg-white px-4 py-2 font-medium text-green-700 transition-colors hover:bg-green-50"
                  >
                    Kembali ke Cart
                  </Link>
                  <Link
                    href="/wishlist"
                    className="inline-flex cursor-pointer rounded-lg border border-white/40 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Buka Wishlist
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 md:px-8">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total pesanan</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {summary.totalOrders}
                </h2>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Produk dibeli</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {summary.totalItems}
                </h2>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Menunggu pembayaran</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {summary.pendingOrders}
                </h2>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total belanja</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    orders[0]?.currency ?? "IDR",
                    summary.totalSpent,
                  )}
                </h2>
              </div>
            </div>
          </section>

          {selectedOrders.size > 0 && (
            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold text-blue-900">
                  {selectedOrders.size} order dipilih
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={proceedToPayment}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    Bayar Sekarang
                  </button>
                  <button
                    onClick={() => setModalType("bulk-cancel")}
                    className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={() => setModalType("bulk-delete")}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={deselectAll}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Batal Pilih
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="space-y-5">
            <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">
                Pilih beberapa order pending untuk dibayar sekaligus.
              </p>
              <button
                onClick={selectAllPending}
                className="rounded-lg border border-green-200 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
              >
                Pilih Semua Pending
              </button>
            </div>

            {sortedOrders.map((order) => {
              const status = statusConfig[order.status] ?? statusConfig.pending;
              const isPending = order.status === "pending";
              const isSelected = selectedOrders.has(order.id);
              const totalQuantity = (order.order_items ?? []).reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              return (
                <article
                  key={order.id}
                  className="rounded-md border border-gray-200 bg-white p-5 shadow-sm md:p-6"
                >
                  <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isPending}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-gray-900">
                            Order #{String(order.id).slice(-8)}
                          </h2>
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1 text-sm font-medium",
                              status.className,
                            )}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {status.description}
                        </p>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                          <span>{formatDate(order.created_at)}</span>
                          <span>{totalQuantity} item</span>
                          <span>
                            {deliveryLabelMap[order.delivery_method] ??
                              order.delivery_method}
                          </span>
                          <span>
                            {paymentLabelMap[order.payment_method] ??
                              order.payment_method}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 lg:text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(order.currency, order.total_price)}
                      </p>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {isPending && (
                          <button
                            onClick={() =>
                              router.push(`/payment?orders=${order.id}`)
                            }
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                          >
                            Bayar
                          </button>
                        )}
                        {isPending && (
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setModalType("cancel");
                            }}
                            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                          >
                            Batalkan
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setModalType("delete");
                          }}
                          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        >
                          Hapus
                        </button>
                        {(order.status === "paid" ||
                          order.status === "shipped" ||
                          order.status === "delivered") && (
                          <button
                            onClick={() =>
                              router.push(`/shipping?orders=${order.id}`)
                            }
                            className="rounded-lg border border-sky-200 px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-50"
                          >
                            Lacak Pengiriman
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 py-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                      {(order.order_items ?? []).map((item) => {
                        const existingReview = reviewMap[item.product_id];

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 md:flex-row"
                          >
                            <div className="relative h-24 w-full overflow-hidden rounded-xl bg-gray-100 md:w-24">
                              <Image
                                src={item.image}
                                alt={item.product_title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  {item.product_title}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                  <span>Varian {item.variant}</span>
                                  <span>Qty {item.quantity}</span>
                                </div>
                                {existingReview && (
                                  <div className="mt-2 inline-flex rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                    Review kamu: {existingReview.rate}/5
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2 md:text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(
                                    order.currency,
                                    item.subtotal,
                                  )}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                  <Link
                                    href={`/product/${item.product_id}/${createSlug(item.product_title)}`}
                                    className="inline-flex cursor-pointer text-sm font-medium text-green-600 transition-colors hover:text-green-700"
                                  >
                                    Lihat produk
                                  </Link>
                                  {order.status === "delivered" && (
                                    <button
                                      onClick={() =>
                                        setReviewDraft({
                                          orderId: order.id,
                                          item,
                                        })
                                      }
                                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
                                    >
                                      {existingReview
                                        ? "Ubah review"
                                        : "Tulis review"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <aside className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Alamat Pengiriman
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-800">
                          {order.shipping_address}
                        </p>
                      </div>
                      {order.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Catatan
                          </p>
                          <p className="mt-1 text-sm leading-6 text-gray-800">
                            {order.notes}
                          </p>
                        </div>
                      )}
                    </aside>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </ContentContainer>

      <CancelOrderModal
        isOpen={modalType === "cancel" || modalType === "bulk-cancel"}
        onClose={closeModal}
        onConfirm={() => {
          const ids =
            modalType === "bulk-cancel"
              ? Array.from(selectedOrders)
              : selectedOrderId
                ? [selectedOrderId]
                : [];
          runOrderAction(
            "PATCH",
            ids,
            `${ids.length} pesanan berhasil dibatalkan.`,
            { status: "cancelled" },
          );
        }}
        isProcessing={isProcessing}
        isBulk={modalType === "bulk-cancel"}
        selectedCount={selectedOrders.size}
      />

      <DeleteOrderModal
        isOpen={modalType === "delete" || modalType === "bulk-delete"}
        onClose={closeModal}
        onConfirm={() => {
          const ids =
            modalType === "bulk-delete"
              ? Array.from(selectedOrders)
              : selectedOrderId
                ? [selectedOrderId]
                : [];
          runOrderAction(
            "DELETE",
            ids,
            `${ids.length} pesanan berhasil dihapus.`,
          );
        }}
        isProcessing={isProcessing}
        isBulk={modalType === "bulk-delete"}
        selectedCount={selectedOrders.size}
      />

      <ReviewComposerModal
        key={
          reviewDraft
            ? `${reviewDraft.item.id}-${reviewMap[reviewDraft.item.product_id]?.updated_at ?? "new"}`
            : "review-modal"
        }
        isOpen={Boolean(reviewDraft)}
        onClose={closeReviewModal}
        productTitle={reviewDraft?.item.product_title ?? ""}
        initialRate={
          reviewDraft ? (reviewMap[reviewDraft.item.product_id]?.rate ?? 0) : 0
        }
        initialComment={
          reviewDraft
            ? (reviewMap[reviewDraft.item.product_id]?.comment ?? "")
            : ""
        }
        onSubmit={submitReview}
      />
    </main>
  );
};

export default OrderPage;
