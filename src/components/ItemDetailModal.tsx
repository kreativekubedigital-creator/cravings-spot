import { MenuItem } from "@/data/menuData";
import { ChevronLeft, Heart, Star, MapPin, Minus, Plus, MessageCircle } from "lucide-react";
import { useState } from "react";

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, qty: number) => void;
}

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const ItemDetailModal = ({ item, onClose, onAddToCart }: ItemDetailModalProps) => {
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0);

  const currentPrice = item.sizeOptions ? item.sizeOptions[selectedSize].price : item.price;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-surface-overlay/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-gradient-to-b from-card to-background rounded-t-[2rem] lg:rounded-[2rem] animate-slide-up overflow-hidden max-h-[92vh] flex flex-col">

        {/* Hero image area */}
        <div className="relative h-64 flex-shrink-0 overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          {/* Top nav */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="glass w-10 h-10 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <span className="text-sm font-semibold text-foreground">Details</span>
            <button
              onClick={() => setLiked(!liked)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                liked ? "bg-primary" : "glass"
              }`}
            >
              <Heart
                size={18}
                className={liked ? "text-primary-foreground fill-primary-foreground" : "text-foreground"}
              />
            </button>
          </div>

          {/* Badge */}
          {item.badge && (
            <span className="absolute bottom-16 left-5 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">
              {item.badge}
            </span>
          )}
        </div>

        {/* Glass content card */}
        <div className="relative -mt-6 flex-1 overflow-y-auto">
          <div className="glass-strong rounded-t-3xl px-6 pt-6 pb-4">
            {/* Name + Price row */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
                  {item.name}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-primary" />
                  <span className="text-xs text-muted-foreground">Lokoja, Kogi State</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-bold text-primary">{formatPrice(currentPrice)}</span>
                {item.oldPrice && (
                  <p className="text-xs text-muted-foreground line-through">{formatPrice(item.oldPrice)}</p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <Star size={14} className="text-primary fill-primary" />
              <span className="text-sm font-semibold text-foreground">{item.rating || "4.5"}</span>
              <span className="text-xs text-muted-foreground">| {item.calories} reviews</span>
            </div>

            {/* Nutrition chips */}
            <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
              <div className="glass rounded-xl px-4 py-2.5 flex-shrink-0">
                <span className="text-xs text-foreground font-semibold">{item.calories}</span>
                <span className="text-[10px] text-muted-foreground ml-1">kcal</span>
              </div>
              <div className="glass rounded-xl px-4 py-2.5 flex-shrink-0">
                <span className="text-xs text-foreground font-semibold">{(item.calories * 0.13).toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground ml-1">proteins</span>
              </div>
              <div className="glass rounded-xl px-4 py-2.5 flex-shrink-0">
                <span className="text-xs text-foreground font-semibold">{(item.calories * 0.07).toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground ml-1">fats</span>
              </div>
              <div className="glass rounded-xl px-4 py-2.5 flex-shrink-0">
                <span className="text-xs text-foreground font-semibold">{item.prepTime || "20 min"}</span>
                <span className="text-[10px] text-muted-foreground ml-1">prep</span>
              </div>
            </div>

            {/* Size options */}
            {item.sizeOptions && item.sizeOptions.length > 0 && (
              <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
                {item.sizeOptions.map((size, idx) => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(idx)}
                    className={`flex-shrink-0 rounded-xl px-4 py-2.5 transition-all text-xs font-semibold ${
                      selectedSize === idx
                        ? "bg-primary text-primary-foreground"
                        : "glass text-muted-foreground"
                    }`}
                  >
                    {size.label} · {formatPrice(size.price)}
                  </button>
                ))}
              </div>
            )}

            {/* Dashed divider */}
            <div className="border-t border-dashed border-primary/30 mb-4" />

            {/* Description */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-foreground mb-1.5">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
                <span className="text-primary font-medium cursor-pointer ml-1">Read More</span>
              </p>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-6 mb-5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="glass w-10 h-10 rounded-full flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-bold text-foreground min-w-[32px] text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="glass w-10 h-10 rounded-full flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="px-6 pb-8 pt-3 flex items-center gap-3">
            <button className="glass w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground">
              <MessageCircle size={18} />
            </button>
            <button
              onClick={() => {
                onAddToCart({ ...item, price: currentPrice }, qty);
                onClose();
              }}
              className="flex-1 bg-primary text-primary-foreground font-semibold py-3.5 rounded-2xl gold-glow transition-all hover:brightness-110 active:scale-[0.98] text-sm"
            >
              Order Now — {formatPrice(currentPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
