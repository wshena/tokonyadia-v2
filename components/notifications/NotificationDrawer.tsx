"use client";

import type { Notification } from "@/types/notification";
import { NotificationItem } from "./NotificationItem";
import { NotificationSkeleton } from "./NotificationSkeleton";
import { BellOffIcon } from "lucide-react";

type Props = {
  notifications: Notification[];
  isLoading: boolean;
  onRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isModal?: boolean;
};

export function NotificationDrawer({
  notifications,
  isLoading,
  onRead,
  onMarkAllAsRead,
  isModal = false,
}: Props) {
  const hasUnread = notifications.some((n) => !n.is_read);

  const containerClassName = isModal
    ? "w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
    : "absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden";

  return (
    <div className={containerClassName}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Notifikasi</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BellOffIcon size={32} className="mb-2" />
            <p className="text-sm">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={onRead} />
          ))
        )}
      </div>
    </div>
  );
}
