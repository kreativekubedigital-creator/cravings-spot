import { useEffect, useState } from "react";
import { Star, Tag, ShoppingBag, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeaturedItem } from "@/lib/types";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const FeaturedPage = () => {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FeaturedItem | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("featured_items")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setItems((data as FeaturedItem[]) ?? []);
      setLoading(false);
    };

    fetchItems();

    const channel = supabase
      .channel("featured-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "featured_items" },
        () => fetchItems()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Star size={22} className="text-primary" />
          Featured Deals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exclusive offers & promos just for you 🎉
        </p>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="text-center py-24">
          <Star size={48} className="text-primary/20 mx-auto mb-4" />
          <p className="text-foreground font-semibold text-lg">No deals right now</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back soon for exclusive offers!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const discount = Math.round(
              ((item.main_price - item.discounted_price) / item.main_price) * 100
            );
            const saving = item.main_price - item.discounted_price;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass-strong rounded-2xl border border-border/50 overflow-hidden group hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                {item.image_url && (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Discount badge */}
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                      -{discount}% OFF
                    </div>
                  </div>
                )}

                <div className="p-4">
                  {/* Title + badge (if no image) */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="font-bold text-foreground text-base leading-snug">
                      {item.title}
                    </h2>
                    {!item.image_url && (
                      <span className="flex-shrink-0 text-xs font-bold bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(item.discounted_price)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(item.main_price)}
                      </span>
                    </div>

                    {/* Savings pill */}
                    <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                      <Tag size={11} className="text-green-400" />
                      <span className="text-xs font-semibold text-green-400">
                        Save {formatPrice(saving)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-4 pb-4">
                  <a
                    href="/menu"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <ShoppingBag size={15} />
                    Order Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative w-full max-w-lg glass-strong border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/50 backdrop-blur-md border border-border rounded-full flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
            >
              <X size={20} />
            </button>

            {selectedItem.image_url && (
              <div className="h-64 sm:h-80 overflow-hidden">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20">
                  Featured Deal
                </div>
                {selectedItem.main_price > selectedItem.discounted_price && (
                  <div className="bg-green-500/15 text-green-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-green-500/20">
                    Save {Math.round(((selectedItem.main_price - selectedItem.discounted_price) / selectedItem.main_price) * 100)}%
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
                {selectedItem.title}
              </h2>

              {selectedItem.description && (
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">
                  {selectedItem.description}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-t border-border/50">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(selectedItem.discounted_price)}
                  </span>
                  <span className="text-base text-muted-foreground line-through opacity-60 font-medium">
                    {formatPrice(selectedItem.main_price)}
                  </span>
                </div>
                
                <a
                  href="/menu"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  <ShoppingBag size={18} />
                  Order Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedPage;
