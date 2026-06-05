"use client";

import { useRef, useState } from "react";
import { BellIcon } from "lucide-react";
import { NotificationDrawer } from "./NotificationDrawer";
import ModalContainer from "@/components/ui/modals/ModalContainer";
import { useAuthStore } from "@/lib/zustand/authStore";
import { useNotifications } from "@/hooks/useNotification";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications(user?.id ?? null);

  useOnClickOutside(ref, () => setIsOpen(false));

  // Jangan render kalau belum login
  if (!user) return null;

  return (
    <>
      <div ref={ref} className="relative hidden sm:block">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notifikasi"
        >
          <BellIcon size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <NotificationDrawer
            notifications={notifications}
            isLoading={isLoading}
            onRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            isModal={false}
          />
        )}
      </div>

      {/* Mobile Modal */}
      <div className="block sm:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notifikasi"
        >
          <BellIcon size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <ModalContainer isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <NotificationDrawer
            notifications={notifications}
            isLoading={isLoading}
            onRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            isModal={true}
          />
        </ModalContainer>
      </div>
    </>
  );
}
