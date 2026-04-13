import { MenuItem } from "@/data/menuData";
import { Star } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
  onTap: (item: MenuItem) => void;
}

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const MenuItemCard = ({ item, onTap }: MenuItemCardProps) => (
  <button
    onClick={() => onTap(item)}
    className="glass rounded-2xl overflow-hidden w-full text-left transition-all hover:ring-1 hover:ring-primary/30 group"
  >
    <div className="relative h-32 lg:h-40 overflow-hidden">
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      {item.badge && (
        <span className="absolute top-2.5 left-2.5 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">
          {item.badge}
        </span>
      )}
    </div>
    <div className="p-3.5">
      <p className="font-semibold text-sm text-foreground truncate mb-0.5">{item.name}</p>
      <div className="flex items-center gap-1.5 mb-2">
        <Star size={10} className="text-primary fill-primary" />
        <span className="text-[10px] text-muted-foreground">
          {item.rating || "4.5"} · {item.prepTime || "20 min"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-primary">{formatPrice(item.price)}</span>
          {item.oldPrice && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(item.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  </button>
);

export default MenuItemCard;
