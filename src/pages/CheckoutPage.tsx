import { useNavigate, useLocation } from "react-router-dom";
import { CartItem } from "@/hooks/useCart";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  CreditCard,
  MapPin,
  Truck,
  User,
  Phone,
  MessageCircle,
  ShieldCheck,
  Navigation,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "2348154430081";
const BANK_DETAILS = {
  bankName: "OPay",
  accountNumber: "8036982453",
  accountName: "Cravings Spot",
};
const DELIVERY_FEE = 1000;
// ──────────────────────────────────────────────────────────────────────────────

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const STEPS = ["Your Order", "Make Payment", "Confirm Order"];

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice } = (location.state as { items: CartItem[]; totalPrice: number }) || {
    items: [],
    totalPrice: 0,
  };

  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [sending, setSending] = useState(false);

  // Generate a unique short order code
  const generateOrderCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return `CS-${code}`;
  };

  const finalTotal = deliveryOption === "delivery" ? totalPrice + DELIVERY_FEE : totalPrice;

  if (items.length === 0) {
    navigate("/menu");
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildWhatsAppMessage = (orderCode: string) => {
    let msg = `🍽️ *New Order — Cravings Spot*\n`;
    msg += `📋 *Order: ${orderCode}*\n\n`;
    msg += `👤 *Name:* ${customerName}\n`;
    msg += `📞 *Phone:* ${customerPhone}\n`;
    msg += `🚗 *${deliveryOption === "delivery" ? "Delivery" : "Pickup"}*\n`;
    if (deliveryOption === "delivery" && deliveryAddress) {
      msg += `📍 *Address:* ${deliveryAddress}\n`;
    }
    msg += `\n*Order Details:*\n`;
    items.forEach((ci) => {
      msg += `• ${ci.item.name} × ${ci.quantity} — ${formatPrice(ci.item.price * ci.quantity)}\n`;
    });
    if (deliveryOption === "delivery") {
      msg += `\n🚚 *Delivery Fee: ${formatPrice(DELIVERY_FEE)}*\n`;
    }
    msg += `\n💰 *Total: ${formatPrice(finalTotal)}*\n`;
    msg += `\n✅ *Payment sent via bank transfer to ${BANK_DETAILS.bankName}*`;
    return encodeURIComponent(msg);
  };

  const handleSendWhatsApp = async () => {
    setSending(true);
    const orderCode = generateOrderCode();

    // Save order to Supabase
    try {
      await supabase.from("orders").insert({
        order_code: orderCode,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_type: deliveryOption,
        delivery_address: deliveryOption === "delivery" ? deliveryAddress : null,
        items: items.map((ci) => ({
          id: ci.item.id,
          name: ci.item.name,
          price: ci.item.price,
          quantity: ci.quantity,
          image: ci.item.image,
        })),
        subtotal: totalPrice,
        delivery_fee: deliveryOption === "delivery" ? DELIVERY_FEE : 0,
        total: finalTotal,
        status: "pending",
        payment_confirmed: false,
      });
    } catch {
      // Graceful fallback — WhatsApp still opens if DB fails
      console.error("Failed to save order to database");
    }

    // Open WhatsApp
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage(orderCode)}`;
    window.open(url, "_blank");
    navigate("/thank-you", { state: { totalPrice: finalTotal, customerName, orderCode } });
  };

  const canProceedStep0 =
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    (deliveryOption === "pickup" || deliveryAddress.trim().length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 glass-strong px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
          className="glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary/60 transition-colors"
        >
          <ChevronLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Checkout</h1>
          <p className="text-xs text-muted-foreground">{STEPS[step]}</p>
        </div>
        {/* Step indicators */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-5 bg-primary"
                  : i < step
                  ? "w-2 bg-primary/60"
                  : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-6 space-y-5">

        {/* ── STEP 0: Order Review + Customer Info ── */}
        {step === 0 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Order Summary */}
            <div className="glass-strong rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-3">Order Summary</h2>
              <div className="space-y-3">
                {items.map((ci) => (
                  <div key={ci.item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={ci.item.image}
                        alt={ci.item.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-border flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate font-medium">{ci.item.name}</p>
                        <p className="text-xs text-muted-foreground">× {ci.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary flex-shrink-0 ml-2">
                      {formatPrice(ci.item.price * ci.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {deliveryOption === "delivery" && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-border">
                  <span className="text-xs text-muted-foreground">Delivery Fee</span>
                  <span className="text-sm font-semibold text-foreground">{formatPrice(DELIVERY_FEE)}</span>
                </div>
              )}

              <div className="border-t border-dashed border-primary/30 mt-4 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Delivery / Pickup */}
            <div className="glass-strong rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-3">Order Type</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryOption("pickup")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    deliveryOption === "pickup"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-muted-foreground"
                  }`}
                >
                  <MapPin size={20} className={deliveryOption === "pickup" ? "text-primary" : "text-muted-foreground"} />
                  <span className={`text-sm font-semibold ${deliveryOption === "pickup" ? "text-primary" : "text-muted-foreground"}`}>
                    Pickup
                  </span>
                  <span className="text-xs text-muted-foreground">Free</span>
                </button>
                <button
                  onClick={() => setDeliveryOption("delivery")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    deliveryOption === "delivery"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-muted-foreground"
                  }`}
                >
                  <Truck size={20} className={deliveryOption === "delivery" ? "text-primary" : "text-muted-foreground"} />
                  <span className={`text-sm font-semibold ${deliveryOption === "delivery" ? "text-primary" : "text-muted-foreground"}`}>
                    Delivery
                  </span>
                  <span className="text-xs text-muted-foreground">+ {formatPrice(DELIVERY_FEE)}</span>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="glass-strong rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-3">Your Details</h2>
              <div className="space-y-3">
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    id="customer-name"
                    placeholder="Full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    id="customer-phone"
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                  />
                </div>

                {/* Address field — shown only for delivery */}
                {deliveryOption === "delivery" && (
                  <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                    <Navigation size={15} className="absolute left-3.5 top-3.5 text-muted-foreground" />
                    <textarea
                      id="customer-address"
                      placeholder="Delivery address (e.g. No 5, Ganaja Road, Lokoja)"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Next CTA */}
            <button
              id="checkout-whatsapp-btn"
              onClick={() => setStep(1)}
              disabled={!canProceedStep0}
              className="w-full bg-[#25D366] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#25D366]/20"
            >
              <WhatsAppIcon />
              Checkout on WhatsApp
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 1: Bank Transfer Payment ── */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard size={26} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Make Payment</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Transfer the exact amount to the account below
              </p>
            </div>

            {/* Amount to pay */}
            <div className="glass-strong rounded-2xl p-5 text-center border border-primary/30">
              <p className="text-xs text-muted-foreground mb-1">Amount to Transfer</p>
              <p className="text-3xl font-bold text-primary">{formatPrice(finalTotal)}</p>
              {deliveryOption === "delivery" && (
                <p className="text-xs text-muted-foreground mt-1">Includes {formatPrice(DELIVERY_FEE)} delivery fee</p>
              )}
            </div>

            {/* Bank Details */}
            <div className="glass-strong rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck size={15} className="text-primary" /> Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">Bank</span>
                  <span className="text-sm font-semibold text-foreground">{BANK_DETAILS.bankName}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">Account Name</span>
                  <span className="text-sm font-semibold text-foreground">{BANK_DETAILS.accountName}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-xs text-muted-foreground">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-primary tracking-widest">
                      {BANK_DETAILS.accountNumber}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                      title="Copy account number"
                    >
                      {copied ? (
                        <Check size={13} className="text-green-400" />
                      ) : (
                        <Copy size={13} className="text-primary" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {copied && (
                <div className="mt-3 text-center">
                  <span className="text-xs text-green-400 font-medium">✓ Account number copied!</span>
                </div>
              )}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                💡 <span className="text-foreground font-medium">Tip:</span> Use your name as payment description.
                After payment, click below to send your order to us on WhatsApp.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all gold-glow"
            >
              I've Made the Transfer
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Confirm & Send on WhatsApp ── */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={26} className="text-[#25D366]" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Last Step!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Send your order details to us on WhatsApp to confirm
              </p>
            </div>

            {/* Order recap */}
            <div className="glass-strong rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground">Order Recap</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground font-medium">{customerPhone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Type</span>
                  <span className="text-foreground font-medium capitalize">{deliveryOption}</span>
                </div>
                {deliveryOption === "delivery" && deliveryAddress && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-foreground font-medium text-right max-w-[55%]">{deliveryAddress}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Items</span>
                  <span className="text-foreground font-medium">{items.length} item{items.length > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="text-primary font-bold">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                📱 Tap the button below to open WhatsApp. Your order details are pre-filled — just hit <strong className="text-foreground">Send</strong> and we'll start preparing your food! 🔥
              </p>
            </div>

            {/* Main CTA */}
            <button
              id="send-whatsapp-order-btn"
              onClick={handleSendWhatsApp}
              disabled={sending}
              className="w-full bg-[#25D366] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#25D366]/25 text-base disabled:opacity-60"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <WhatsAppIcon />
                  Send Order on WhatsApp
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              You'll be redirected to WhatsApp with your order pre-filled
            </p>
          </div>
        )}

        <div className="h-28 lg:h-8" />
      </div>
    </div>
  );
};

export default CheckoutPage;
