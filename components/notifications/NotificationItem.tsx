"use client";

import type { Notification } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { BellIcon, PackageIcon, TagIcon, RefreshCwIcon } from "lucide-react";

const iconMap: Record<Notification["type"], React.ReactNode> = {
  order_update: <PackageIcon size={16} />,
  restock: <RefreshCwIcon size={16} />,
  flash_sale: <TagIcon size={16} />,
  promo: <TagIcon size={16} />,
};

type Props = {
  notification: Notification;
  onRead: (id: string) => void;
};

export function NotificationItem({ notification, onRead }: Props) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: id,
  });

  const content = (
    <div
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
        !notification.is_read ? "bg-green-50" : "bg-white"
      }`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 p-2 rounded-full shrink-0 ${
          !notification.is_read
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {iconMap[notification.type] ?? <BellIcon size={16} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            !notification.is_read
              ? "font-semibold text-gray-900"
              : "font-normal text-gray-700"
          }`}
        >
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />
      )}
    </div>
  );

  // Kalau ada link, wrap dengan Next.js Link
  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
}
