export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface FeaturedItem {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  main_price: number;
  discounted_price: number;
  image_url: string | null;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: "pickup" | "delivery";
  delivery_address?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_confirmed: boolean;
  notes?: string;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  preparing: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  ready: "bg-green-500/15 text-green-400 border-green-500/30",
  delivered: "bg-muted/40 text-muted-foreground border-border",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};

export const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Confirm Order",
  confirmed: "Start Preparing",
  preparing: "Mark Ready",
  ready: "Mark Delivered",
};
