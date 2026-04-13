import { useEffect, useState } from "react";
import {
  Search,
  Phone,
  MapPin,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Order,
  OrderStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  NEXT_STATUS,
  NEXT_STATUS_LABEL,
} from "@/lib/types";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;
const WHATSAPP_NUMBER_RAW = "2348154430081";

const FILTER_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from("orders").update({ status }).eq("id", id);
  };

  const togglePayment = async (id: string, current: boolean) => {
    await supabase
      .from("orders")
      .update({ payment_confirmed: !current })
      .eq("id", id);
  };

  const cancelOrder = async (id: string) => {
    await supabase
      .from("orders")
      .update({ status: "cancelled" as OrderStatus })
      .eq("id", id);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const intlPhone = cleanPhone.startsWith("0")
      ? "234" + cleanPhone.slice(1)
      : cleanPhone;
    const msg = encodeURIComponent(
      `Hi ${name}! This is Cravings Spot. Regarding your order — `
    );
    window.open(`https://wa.me/${intlPhone}?text=${msg}`, "_blank");
  };

  // Filtering
  const filtered = orders
    .filter((o) => filter === "all" || o.status === filter)
    .filter(
      (o) =>
        !search ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_phone.includes(search)
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track all customer orders
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === tab.value
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary/30 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            const nextStatus = NEXT_STATUS[order.status];
            const nextLabel = NEXT_STATUS_LABEL[order.status];

            return (
              <div
                key={order.id}
                className="glass-strong rounded-2xl border border-border/50 overflow-hidden transition-all"
              >
                {/* Header — always visible */}
                <button
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-secondary/20 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order.id)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {order.customer_name}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          STATUS_COLORS[order.status]
                        }`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                      {order.payment_confirmed && (
                        <CheckCircle2
                          size={13}
                          className="text-green-400 flex-shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""} ·{" "}
                      {order.delivery_type === "delivery" ? "🚚 Delivery" : "📍 Pickup"} ·{" "}
                      {new Date(order.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary flex-shrink-0">
                    {formatPrice(order.total)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Contact */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          openWhatsApp(
                            order.customer_phone,
                            order.customer_name
                          )
                        }
                        className="flex items-center gap-1.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                      >
                        <MessageCircle size={12} />
                        WhatsApp
                      </button>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={11} /> {order.customer_phone}
                      </span>
                      {order.delivery_type === "delivery" && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Truck size={11} /> Delivery
                        </span>
                      )}
                      {order.delivery_type === "pickup" && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin size={11} /> Pickup
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    {order.delivery_address && (
                      <div className="bg-secondary/30 rounded-xl px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          📍 <span className="text-foreground">{order.delivery_address}</span>
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    <div className="bg-secondary/30 rounded-xl p-3 space-y-2">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">
                            {item.name}{" "}
                            <span className="text-muted-foreground">
                              ×{item.quantity}
                            </span>
                          </span>
                          <span className="text-primary font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.delivery_fee > 0 && (
                        <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2">
                          <span className="text-muted-foreground">
                            Delivery Fee
                          </span>
                          <span className="text-foreground font-medium">
                            {formatPrice(order.delivery_fee)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm border-t border-dashed border-primary/30 pt-2">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="font-bold text-primary">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {/* Payment toggle */}
                      <button
                        onClick={() =>
                          togglePayment(order.id, order.payment_confirmed)
                        }
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          order.payment_confirmed
                            ? "bg-green-500/15 text-green-400 border-green-500/30"
                            : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        <CheckCircle2 size={13} />
                        {order.payment_confirmed
                          ? "Payment ✓"
                          : "Confirm Payment"}
                      </button>

                      {/* Advance status */}
                      {nextStatus && nextLabel && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.97] transition-all"
                        >
                          {nextLabel}
                        </button>
                      )}

                      {/* Cancel */}
                      {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all ml-auto"
                          >
                            <XCircle size={13} />
                            Cancel
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
