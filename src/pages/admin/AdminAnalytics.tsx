import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Clock, Truck } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 80%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(30, 80%, 55%)",
  "hsl(340, 70%, 55%)",
];

const AdminAnalytics = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const confirmedOrders = orders.filter((o) => o.payment_confirmed);
  const totalRevenue = confirmedOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue =
    confirmedOrders.length > 0
      ? Math.round(totalRevenue / confirmedOrders.length)
      : 0;

  // Revenue by day (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const dayOrders = confirmedOrders.filter((o) => {
      const t = new Date(o.created_at);
      return t >= d && t < next;
    });

    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      count: dayOrders.length,
    };
  });

  // Top 5 items
  const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
  confirmedOrders.forEach((o) => {
    o.items.forEach((item) => {
      const existing = itemMap.get(item.name) || {
        name: item.name,
        qty: 0,
        revenue: 0,
      };
      existing.qty += item.quantity;
      existing.revenue += item.price * item.quantity;
      itemMap.set(item.name, existing);
    });
  });
  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Delivery vs Pickup
  const deliveryCount = orders.filter(
    (o) => o.delivery_type === "delivery"
  ).length;
  const pickupCount = orders.filter(
    (o) => o.delivery_type === "pickup"
  ).length;
  const deliveryData = [
    { name: "Delivery", value: deliveryCount },
    { name: "Pickup", value: pickupCount },
  ];

  // Peak hours
  const hourMap = new Map<number, number>();
  orders.forEach((o) => {
    const hour = new Date(o.created_at).getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });
  const peakHours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}:00`,
    orders: hourMap.get(h) || 0,
  })).filter((h) => h.orders > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sales performance and insights
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold text-primary mt-1">
            {formatPrice(totalRevenue)}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Total Orders</p>
          <p className="text-xl font-bold text-blue-400 mt-1">
            {orders.length}
          </p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Avg Order Value</p>
          <p className="text-xl font-bold text-green-400 mt-1">
            {formatPrice(avgOrderValue)}
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Confirmed Payments</p>
          <p className="text-xl font-bold text-amber-400 mt-1">
            {confirmedOrders.length}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="glass-strong rounded-2xl p-5 border border-border/50">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            14-Day Revenue Trend
          </h2>
        </div>
        <div className="h-56 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last14Days}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="day"
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  `₦${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value: number) => [
                  formatPrice(value),
                  "Revenue",
                ]}
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

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Items */}
        <div className="glass-strong rounded-2xl p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Top Selling Items
            </h2>
          </div>
          {topItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No sales data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => {
                const maxRev = topItems[0]?.revenue || 1;
                const pct = (item.revenue / maxRev) * 100;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground font-medium truncate max-w-[60%]">
                        {i + 1}. {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.qty} sold · {formatPrice(item.revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delivery vs Pickup */}
        <div className="glass-strong rounded-2xl p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Delivery vs Pickup
            </h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No orders yet.
            </p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {deliveryData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            i === 0
                              ? "hsl(var(--primary))"
                              : "hsl(210, 80%, 55%)"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">
                    Delivery: {deliveryCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "hsl(210, 80%, 55%)" }}
                  />
                  <span className="text-sm text-foreground">
                    Pickup: {pickupCount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Peak Hours */}
      {peakHours.length > 0 && (
        <div className="glass-strong rounded-2xl p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Peak Ordering Hours
            </h2>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="hour"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [value, "Orders"]}
                />
                <Bar
                  dataKey="orders"
                  fill="hsl(30, 80%, 55%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
