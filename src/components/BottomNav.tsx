import { Home, ShoppingBag, ClipboardList } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavProps {
  onCartOpen?: () => void;
  cartCount?: number;
}

const BottomNav = ({ onCartOpen, cartCount = 0 }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="mx-4 mb-3">
        <div className="glass-strong rounded-2xl flex items-center justify-around py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {[
            { id: "/", label: "Home", icon: Home },
            { id: "/menu", label: "Menu", icon: ShoppingBag },
          ].map((tab) => {
            const isActive = location.pathname === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`flex flex-col items-center gap-0 px-3 py-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[8px] font-semibold tracking-wide">{tab.label}</span>
              </button>
            );
          })}

          {/* Center floating cart button */}
          <button
            onClick={onCartOpen}
            className="relative mt-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg gold-glow active:scale-95 transition-transform"
          >
            <ShoppingBag size={16} className="text-primary-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                {cartCount}
              </span>
            )}
          </button>

          {[
            { id: "/orders", label: "Orders", icon: ClipboardList },
          ].map((tab) => {
            const isActive = location.pathname === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`flex flex-col items-center gap-0 px-3 py-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[8px] font-semibold tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
