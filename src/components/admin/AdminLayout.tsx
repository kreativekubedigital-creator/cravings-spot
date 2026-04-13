import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Star,
  UtensilsCrossed,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChefHat,
} from "lucide-react";
import { useState } from "react";


const navItems = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { path: "/admin/featured", icon: Star, label: "Featured" },
  { path: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
  { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const { supabase: sb } = await import("@/lib/supabase");
    await sb.auth.signOut();
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <ChefHat size={18} className="text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground leading-tight truncate">Cravings Spot</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`
            }
          >
            <Icon size={17} className="flex-shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border/50 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all w-full"
        >
          <LogOut size={17} className="flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-secondary/10 border-r border-border/50 z-30 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-background border-r border-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-end px-4 pt-4 pb-0 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-secondary/50 active:scale-[0.95] transition-all flex-shrink-0"
            >
              <Menu size={20} className="text-foreground" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <ChefHat size={13} className="text-primary-foreground" />
              </div>
              <p className="font-bold text-foreground text-sm truncate">Cravings Spot</p>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full ml-auto flex-shrink-0">Admin</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto px-4 py-5 lg:px-8 lg:py-8 pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
