import { categories } from "@/data/menuData";
import { useRef } from "react";

interface CategoryBarProps {
  active: string;
  onSelect: (id: string) => void;
}

const CategoryBar = ({ active, onSelect }: CategoryBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="px-5 mb-5 lg:px-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-foreground">Popular Categories</h2>
        <span className="text-xs text-primary font-medium">See all</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-3 pt-1 px-1 -mx-1 lg:flex-wrap lg:overflow-visible"
      >
        {categories.map((cat) => {
          const isActive = cat.id === active;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex-shrink-0 flex flex-col items-center justify-center transition-all duration-300 rounded-2xl min-w-[80px] ${
                isActive
                  ? "ring-2 ring-primary"
                  : ""
              }`}
            >
              <div
                className={`relative w-[76px] h-[76px] rounded-2xl overflow-hidden mb-1.5 transition-all duration-300 ${
                  isActive ? "glass-strong ring-1 ring-primary/50" : "glass"
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover opacity-80"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              <span
                className={`text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
