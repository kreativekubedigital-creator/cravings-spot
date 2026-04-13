import { Home, UtensilsCrossed, Star, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

const navItems = [
  { id: "/", label: "Home", icon: Home },
  { id: "/menu", label: "Menu", icon: UtensilsCrossed },
  { id: "/featured", label: "Featured", icon: Star },
  { id: "/orders", label: "Track Order", icon: Package },
];

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-40 flex-col bg-card border-r border-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <img src={logo} alt="Cravings Spot" className="w-14 h-14 rounded-full object-cover gold-glow" />
        <div>
          <h1 className="font-display text-base font-bold text-primary gold-text-glow tracking-wide">
            CRAVINGS SPOT
          </h1>
          <p className="text-[9px] text-muted-foreground tracking-widest uppercase">
            Lokoja, Kogi State
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.id || 
            (item.id === "/" && location.pathname === "/menu");
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          © 2026 Cravings Spot
        </p>
      </div>
    </aside>
  );
};

export default DesktopNav;
