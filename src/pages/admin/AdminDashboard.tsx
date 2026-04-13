import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Order } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      .channel("dashboard-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(
    (o) => new Date(o.created_at) >= today
  );
  const todayRevenue = todayOrders
    .filter((o) => o.payment_confirmed)
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedToday = todayOrders.filter(
    (o) => o.status === "delivered"
  ).length;

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const dayOrders = orders.filter((o) => {
      const t = new Date(o.created_at);
      return t >= d && t < next;
    });

    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: dayOrders
        .filter((o) => o.payment_confirmed)
        .reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  const stats = [
    {
      label: "Today's Orders",
      value: todayOrders.length.toString(),
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Today's Revenue",
      value: formatPrice(todayRevenue),
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.length.toString(),
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Completed Today",
      value: completedToday.toString(),
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border p-4 lg:p-5 ${s.bg} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-foreground">
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="glass-strong rounded-2xl p-5 border border-border/50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              7-Day Revenue
            </h2>
          </div>
        </div>
        <div className="h-52 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 13,
                }}
                formatter={(value: number) => [formatPrice(value), "Revenue"]}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pending Orders */}
        <div className="glass-strong rounded-2xl p-5 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock size={14} className="text-amber-400" />
              Pending Orders
            </h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:brightness-110"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              🎉 No pending orders right now!
            </p>
          ) : (
            <div className="space-y-2">
              {pendingOrders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/orders")}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {o.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.items.length} item{o.items.length > 1 ? "s" : ""} ·{" "}
                      {new Date(o.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(o.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completed */}
        <div className="glass-strong rounded-2xl p-5 border border-border/50">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <CheckCircle2 size={14} className="text-green-400" />
            Recently Completed
          </h2>
          {orders.filter((o) => o.status === "delivered").length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No completed orders yet.
            </p>
          ) : (
            <div className="space-y-2">
              {orders
                .filter((o) => o.status === "delivered")
                .slice(0, 5)
                .map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/30"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {o.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-400">
                      {formatPrice(o.total)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
