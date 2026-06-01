export type NotificationType =
  | "order_update"
  | "restock"
  | "flash_sale"
  | "promo";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};
