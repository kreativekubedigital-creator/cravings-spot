import { Leaf, Drumstick } from "lucide-react";

type Filter = "all" | "veg" | "non-veg";

interface FilterChipsProps {
  active: Filter;
  onSelect: (f: Filter) => void;
}

const filters: { id: Filter; label: string; icon?: React.ReactNode }[] = [
  { id: "all", label: "All" },
  { id: "veg", label: "Veg", icon: <Leaf size={10} /> },
  { id: "non-veg", label: "Non", icon: <Drumstick size={10} /> },
];

const FilterChips = ({ active, onSelect }: FilterChipsProps) => (
  <div className="flex items-center gap-1.5">
    {filters.map((f) => {
      const isActive = f.id === active;
      return (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "glass text-muted-foreground hover:text-foreground"
          }`}
        >
          {f.icon && (
            <span className={isActive ? "text-primary-foreground" : f.id === "veg" ? "text-green-500" : "text-red-400"}>
              {f.icon}
            </span>
          )}
          {f.label}
        </button>
      );
    })}
  </div>
);

export default FilterChips;
