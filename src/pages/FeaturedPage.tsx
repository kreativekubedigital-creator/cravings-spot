import { useEffect, useState } from "react";
import { Star, Tag, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeaturedItem } from "@/lib/types";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const FeaturedPage = () => {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

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
                className="glass-strong rounded-2xl border border-border/50 overflow-hidden group hover:border-primary/30 transition-all duration-300"
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
                    <p className="text-sm text-muted-foreground mb-3">
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
    </div>
  );
};

export default FeaturedPage;
