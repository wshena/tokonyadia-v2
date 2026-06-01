export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  variant: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  image: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number;
  currency: string;
  shipping_address: string; // JSON string, di-parse saat render
  notes: string | null;
  payment_method: string | null;
  delivery_method: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  // dari getOrderById
  paymentMethod: string | null;
  deliveryMethod: string | null;
};

export type ShippingAddress = {
  name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
};
