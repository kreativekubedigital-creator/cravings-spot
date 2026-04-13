import { useEffect, useState } from "react";
import { Search, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { menuItems, categories } from "@/data/menuData";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

interface Availability {
  item_id: string;
  is_available: boolean;
}

const AdminMenu = () => {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchAvailability = async () => {
    const { data } = await supabase.from("menu_availability").select("*");
    const map: Record<string, boolean> = {};
    (data as Availability[] | null)?.forEach((row) => {
      map[row.item_id] = row.is_available;
    });
    setAvailability(map);
    setLoading(false);
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const toggleAvailability = async (itemId: string) => {
    const current = availability[itemId] ?? true;
    const next = !current;

    setAvailability((prev) => ({ ...prev, [itemId]: next }));

    // Upsert
    await supabase.from("menu_availability").upsert(
      { item_id: itemId, is_available: next },
      { onConflict: "item_id" }
    );
  };

  const filteredItems = menuItems
    .filter(
      (item) =>
        selectedCategory === "all" || item.category === selectedCategory
    )
    .filter(
      (item) =>
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase())
    );

  const availableCount = menuItems.filter(
    (item) => availability[item.id] !== false
  ).length;
  const soldOutCount = menuItems.length - availableCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Menu Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle items on or off to mark them available or sold out.
        </p>
      </div>

      {/* Summary */}
      <div className="flex gap-3">
        <div className="bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-lg font-bold text-green-400">{availableCount}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
          <p className="text-xs text-muted-foreground">Sold Out</p>
          <p className="text-lg font-bold text-red-400">{soldOutCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selectedCategory === "all"
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-secondary/30 text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedCategory === cat.id
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-secondary/30 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const isAvailable = availability[item.id] !== false;

          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isAvailable
                  ? "bg-secondary/20 border-border/50"
                  : "bg-red-500/5 border-red-500/20 opacity-60"
              }`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.price)}
                  {!isAvailable && (
                    <span className="ml-2 text-red-400 font-medium">
                      SOLD OUT
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => toggleAvailability(item.id)}
                className="flex-shrink-0"
                title={isAvailable ? "Mark Sold Out" : "Mark Available"}
              >
                {isAvailable ? (
                  <ToggleRight size={28} className="text-green-400" />
                ) : (
                  <ToggleLeft size={28} className="text-red-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMenu;
