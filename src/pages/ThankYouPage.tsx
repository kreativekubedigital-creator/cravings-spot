import { useNavigate, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalPrice, customerName, orderCode } = (location.state as { totalPrice?: number; customerName?: string; orderCode?: string }) || {};
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const steps = [
    { icon: "✅", label: "Order received", done: true },
    { icon: "🍳", label: "Being prepared", done: true },
    { icon: "🚀", label: "On the way / Ready for pickup", done: false },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <div
        className={`max-w-sm w-full text-center space-y-7 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Animated success icon */}
        <div className="relative mx-auto w-28 h-28">
          <div className="absolute inset-0 bg-[#25D366]/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-[#25D366]/10 rounded-full animate-ping [animation-delay:200ms]" />
          <div className="relative w-28 h-28 bg-[#25D366]/15 rounded-full flex items-center justify-center">
            <CheckCircle2 size={52} className="text-[#25D366]" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            {customerName ? `Thank you, ${customerName.split(" ")[0]}!` : "Thank you!"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Your order is confirmed. We are now{" "}
            <span className="text-primary font-semibold">processing your order</span> and will get
            it ready as soon as possible. 🔥
          </p>
          {totalPrice && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
              <span className="text-xs text-muted-foreground">Total Paid</span>
              <span className="text-sm font-bold text-primary">{formatPrice(totalPrice)}</span>
            </div>
          )}
          {orderCode && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-secondary/40 border border-border px-3 py-1.5 rounded-full">
              <span className="text-xs text-muted-foreground">Order Code</span>
              <span className="text-sm font-mono font-bold text-primary">{orderCode}</span>
            </div>
          )}
        </div>

        {/* Processing status */}
        <div className="glass-strong rounded-2xl p-5 text-left">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Order Status</h3>
          </div>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    s.done ? "bg-[#25D366]/15" : "bg-secondary/50"
                  }`}
                >
                  {s.icon}
                </div>
                <span
                  className={`text-sm ${
                    s.done ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                  {i === 1 && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-left">
          <p className="text-xs text-muted-foreground leading-relaxed space-y-1">
            📞 <span className="text-foreground font-medium">Our team will contact you</span> on the phone number you provided to confirm delivery details.<br /><br />
            💬 Check your <span className="text-[#25D366] font-medium">WhatsApp</span> — we may send updates there too.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <button
            id="thank-you-home-btn"
            onClick={() => navigate("/")}
            className="flex-1 glass-strong py-3.5 rounded-xl text-sm font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-secondary/60 transition-colors"
          >
            <Home size={16} />
            Home
          </button>
          <button
            id="thank-you-order-more-btn"
            onClick={() => navigate("/menu")}
            className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 gold-glow hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <UtensilsCrossed size={16} />
            Order More
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
