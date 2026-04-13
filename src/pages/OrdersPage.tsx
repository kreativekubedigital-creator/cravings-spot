import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";

const sampleOrders = [
  {
    id: "ORD-001",
    date: "Today, 2:30 PM",
    items: ["Jollof Rice with Beef", "Fresh Zobo Drink"],
    total: 3800,
    status: "preparing" as const,
  },
  {
    id: "ORD-002",
    date: "Yesterday, 7:15 PM",
    items: ["Cravings Burger", "Shawarma Wrap Special"],
    total: 7200,
    status: "delivered" as const,
  },
];

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const OrdersPage = () => (
  <div className="px-5 pb-32 lg:px-8 lg:pb-16">
    <h2 className="font-display text-lg font-bold text-foreground mb-5 lg:text-xl">Your Orders</h2>

    {sampleOrders.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ClipboardList size={28} className="text-primary" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">No Orders Yet</h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Your order history will appear here once you place your first order.
        </p>
      </div>
    ) : (
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {sampleOrders.map((order) => (
          <div key={order.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-primary">{order.id}</span>
              <div className="flex items-center gap-1.5">
                {order.status === "preparing" ? (
                  <Clock size={12} className="text-yellow-500" />
                ) : (
                  <CheckCircle2 size={12} className="text-green-500" />
                )}
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                  order.status === "preparing" ? "text-yellow-500" : "text-green-500"
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            <p className="text-sm text-foreground font-medium mb-1">
              {order.items.join(", ")}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-muted-foreground">{order.date}</span>
              <span className="text-sm font-bold text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default OrdersPage;
