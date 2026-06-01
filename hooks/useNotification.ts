"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useRef, useState } from "react";
import type { Notification } from "@/types/notification";

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useRef(createClient());

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Fetch notifikasi awal
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.current
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
      setIsLoading(false);
    };

    fetchNotifications();
  }, [userId]);

  // Subscribe Realtime untuk notifikasi baru
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.current
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.current.removeChannel(channel);
    };
  }, [userId]);

  // Mark satu notifikasi sebagai sudah dibaca
  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );

    await supabase.current
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
  };

  // Mark semua sebagai sudah dibaca
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    await supabase.current
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId!)
      .eq("is_read", false);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}
