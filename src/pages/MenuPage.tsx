import { useState, useMemo } from "react";
import CategoryBar from "@/components/CategoryBar";
import SearchBar from "@/components/SearchBar";
import FilterChips from "@/components/FilterChips";
import MenuItemCard from "@/components/MenuItemCard";
import FeaturedCard from "@/components/FeaturedCard";
import ItemDetailModal from "@/components/ItemDetailModal";
import { categories, menuItems, MenuItem } from "@/data/menuData";
import { useCart } from "@/hooks/useCart";
import CartDrawer from "@/components/CartDrawer";
import { ShoppingBag } from "lucide-react";

type DietFilter = "all" | "veg" | "non-veg";

interface MenuPageProps {
  cart: ReturnType<typeof useCart>;
}

const MenuPage = ({ cart }: MenuPageProps) => {
  const [activeCategory, setActiveCategory] = useState("breakfast");
  const [search, setSearch] = useState("");
  const [dietFilter, setDietFilter] = useState<DietFilter>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.category !== activeCategory) return false;
      if (dietFilter !== "all" && item.diet !== dietFilter) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, dietFilter, search]);

  const featuredItem = filteredItems[0];
  const restItems = filteredItems.slice(1);
  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name || "";

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <CategoryBar active={activeCategory} onSelect={setActiveCategory} />

      {/* Featured item — large card */}
      {featuredItem && (
        <div className="px-5 mb-5 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">{activeCategoryName}</h2>
          </div>
          <FeaturedCard item={featuredItem} onTap={setSelectedItem} />
        </div>
      )}

      {/* Trending / remaining items */}
      {restItems.length > 0 && (
        <div className="px-5 mb-5 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
            <FilterChips active={dietFilter} onSelect={setDietFilter} />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {restItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onTap={setSelectedItem} />
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="px-5 lg:px-8">
          <p className="text-center text-muted-foreground py-16 text-sm">No dishes found</p>
        </div>
      )}

      <div className="h-28 lg:h-16" />

      {/* Cart FAB — hidden on mobile (cart is in center of bottom nav) */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-24 right-5 z-30 lg:bottom-8 lg:right-8 bg-primary text-primary-foreground w-14 h-14 rounded-full hidden lg:flex items-center justify-center gold-glow shadow-lg hover:brightness-110 active:scale-95 transition-all"
      >
        <ShoppingBag size={22} />
        {cart.totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cart.totalItems}
          </span>
        )}
      </button>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={cart.addItem}
        />
      )}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        totalPrice={cart.totalPrice}
        onUpdateQty={cart.updateQuantity}
        onRemove={cart.removeItem}
      />
    </>
  );
};

export default MenuPage;
