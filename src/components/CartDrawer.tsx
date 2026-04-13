import { CartItem } from "@/hooks/useCart";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const CartDrawer = ({ open, onClose, items, totalPrice, onUpdateQty, onRemove }: CartDrawerProps) => {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-surface-overlay/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-t-3xl lg:rounded-3xl animate-slide-up max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Your Cart</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {items.map((ci) => (
                <div key={ci.item.id} className="flex items-center gap-3">
                  <img
                    src={ci.item.image}
                    alt={ci.item.name}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{ci.item.name}</p>
                    <p className="text-xs text-primary font-bold">{formatPrice(ci.item.price * ci.quantity)}</p>
                  </div>
                  <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
                    <button
                      onClick={() => onUpdateQty(ci.item.id, ci.quantity - 1)}
                      className="px-2.5 py-1.5 text-foreground hover:bg-border transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-xs font-bold text-foreground">{ci.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(ci.item.id, ci.quantity + 1)}
                      className="px-2.5 py-1.5 text-foreground hover:bg-border transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button onClick={() => onRemove(ci.item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate("/checkout", { state: { items, totalPrice } });
              }}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl gold-glow hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
