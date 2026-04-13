import { useState } from "react";
import { Search, Package, Clock, CheckCircle2, XCircle, ChefHat, Truck, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Order, STATUS_LABELS } from "@/lib/types";
import { useLocation } from "react-router-dom";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const STATUS_STEPS = [
  { key: "pending", label: "Order Received", icon: Package, emoji: "📋" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2, emoji: "✅" },
  { key: "preparing", label: "Being Prepared", icon: ChefHat, emoji: "👨‍🍳" },
  { key: "ready", label: "Ready", icon: MapPin, emoji: "🎉" },
  { key: "delivered", label: "Completed", icon: Truck, emoji: "🚀" },
] as const;

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  delivered: 4,
  cancelled: -1,
};

const OrdersPage = () => {
  const location = useLocation();
  const prefilled = (location.state as { orderCode?: string })?.orderCode || "";

  const [code, setCode] = useState(prefilled);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    const { data, error: err } = await supabase
      .from("orders")
      .select("*")
      .eq("order_code", trimmed)
      .maybeSingle();

    if (err) {
      setError("Something went wrong. Please try again.");
    } else if (!data) {
      setError("No order found with that code. Please check and try again.");
    } else {
      setOrder(data as Order);
    }

    setLoading(false);
  };

  const currentStep = order ? STATUS_INDEX[order.status] ?? -1 : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Package size={20} className="text-primary" />
          Track Your Order
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your order code to see real-time status
        </p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="e.g. CS-K7V3N"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            className="w-full pl-10 pr-4 py-3 bg-secondary/40 border border-border rounded-xl text-sm font-mono text-foreground placeholder:text-muted-foreground placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all tracking-wider"
          />
        </div>
        <button
          onClick={handleTrack}
          disabled={loading || !code.trim()}
          className="px-5 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              Track
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
          <XCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Empty prompt */}
      {!searched && !order && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-secondary/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-primary/30" />
          </div>
          <p className="text-foreground font-medium">Enter your order code</p>
          <p className="text-sm text-muted-foreground mt-1">
            You'll find it on your Thank You page or WhatsApp message
          </p>
        </div>
      )}

      {/* Order Result */}
      {order && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Order Header */}
          <div className="glass-strong rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {order.order_code}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isCancelled
                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                    : currentStep >= 4
                    ? "bg-green-500/15 text-green-400 border-green-500/30"
                    : "bg-primary/15 text-primary border-primary/30"
                }`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="text-sm text-foreground font-medium">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(order.created_at).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              {" · "}
              {order.delivery_type === "delivery" ? "🚚 Delivery" : "📍 Pickup"}
            </p>
          </div>

          {/* Status Timeline */}
          {!isCancelled ? (
            <div className="glass-strong rounded-2xl p-5 border border-border/50">
              <h3 className="text-sm font-bold text-foreground mb-4">Order Progress</h3>
              <div className="space-y-0">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = currentStep >= i;
                  const isCurrent = currentStep === i;
                  const isLast = i === STATUS_STEPS.length - 1;

                  return (
                    <div key={step.key} className="flex gap-3">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm transition-all ${
                            isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110"
                              : isDone
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary/50 text-muted-foreground"
                          }`}
                        >
                          {step.emoji}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-8 my-1 rounded-full transition-all ${
                              isDone && currentStep > i
                                ? "bg-primary/40"
                                : "bg-border"
                            }`}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className="pt-1.5 pb-3">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent
                              ? "text-primary"
                              : isDone
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:100ms]" />
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:200ms]" />
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-strong rounded-2xl p-5 border border-red-500/20 text-center">
              <XCircle size={32} className="text-red-400 mx-auto mb-2" />
              <p className="text-foreground font-medium">Order Cancelled</p>
              <p className="text-xs text-muted-foreground mt-1">
                This order was cancelled. Please place a new order if needed.
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="glass-strong rounded-2xl p-4 border border-border/50">
            <h3 className="text-sm font-bold text-foreground mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {item.name}{" "}
                    <span className="text-muted-foreground">×{item.quantity}</span>
                  </span>
                  <span className="text-primary font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {order.delivery_fee > 0 && (
                <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-foreground font-medium">
                    {formatPrice(order.delivery_fee)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm border-t border-dashed border-primary/30 pt-2">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50">
            {order.payment_confirmed ? (
              <>
                <CheckCircle2 size={15} className="text-green-400" />
                <span className="text-sm text-green-400 font-medium">Payment Confirmed</span>
              </>
            ) : (
              <>
                <Clock size={15} className="text-amber-400" />
                <span className="text-sm text-amber-400 font-medium">Payment Pending</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
