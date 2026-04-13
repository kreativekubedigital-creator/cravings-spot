import { MenuItem } from "@/data/menuData";
import { Star, ArrowUpRight } from "lucide-react";

interface FeaturedCardProps {
  item: MenuItem;
  onTap: (item: MenuItem) => void;
}

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const FeaturedCard = ({ item, onTap }: FeaturedCardProps) => (
  <button
    onClick={() => onTap(item)}
    className="relative w-full rounded-3xl overflow-hidden group"
  >
    <div className="aspect-[4/3] w-full">
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
    
    {/* Badge */}
    {item.badge && (
      <span className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">
        {item.badge}
      </span>
    )}

    {/* Bottom glass overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="glass-strong rounded-2xl p-3.5 flex items-center justify-between">
        <div className="text-left">
          <p className="text-sm font-bold text-foreground">{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Star size={10} className="text-primary fill-primary" />
            <span className="text-[10px] text-muted-foreground">
              {item.rating || "4.5"} · {item.prepTime || "20 min"} · {item.calories} Cal
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <ArrowUpRight size={16} className="text-primary" />
        </div>
      </div>
    </div>
  </button>
);

export default FeaturedCard;
