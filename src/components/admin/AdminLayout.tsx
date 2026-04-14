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
  Bell,
  BellOff,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { playNotificationSound } from "@/lib/audio";
import { useAdmin } from "./ProtectedRoute";

type Role = "superadmin" | "order_admin" | "menu_admin";

const navItems = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", allowedRoles: ["superadmin", "order_admin", "menu_admin"] },
  { path: "/admin/orders", icon: ShoppingBag, label: "Orders", allowedRoles: ["superadmin", "order_admin"] },
  { path: "/admin/featured", icon: Star, label: "Featured", allowedRoles: ["superadmin", "menu_admin"] },
  { path: "/admin/menu", icon: UtensilsCrossed, label: "Menu", allowedRoles: ["superadmin", "menu_admin"] },
  { path: "/admin/analytics", icon: BarChart3, label: "Analytics", allowedRoles: ["superadmin"] },
  { path: "/admin/team", icon: Users, label: "Team", allowedRoles: ["superadmin"] },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { role } = useAdmin();
  const safeRole = role || "superadmin";

  const permittedNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(safeRole)
  );

  useEffect(() => {
    // Check permission on mount
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }

    const channel = supabase
      .channel("admin-global-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          if (notificationsEnabled || Notification.permission === "granted") {
             playNotificationSound();
             const order = payload.new;
             if ("Notification" in window && Notification.permission === "granted") {
               new Notification("New Order Received! 🔥", {
                 body: `${order.customer_name} placed a new order (${order.order_code || 'N/A'}).`,
                 icon: "/favicon.ico" // optional if you have one
               });
             }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notificationsEnabled]);

  const toggleNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Your browser does not support desktop notifications.");
      return;
    }

    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        playNotificationSound(); // Demo preview
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
        {permittedNavItems.map(({ path, icon: Icon, label }) => (
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

      {/* Notifications toggle */}
      <div className="px-3 pt-3 border-t border-border/50 flex-shrink-0">
        <button
          onClick={toggleNotifications}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all w-full hover:bg-secondary/60"
        >
          <div className="flex items-center gap-3">
             {notificationsEnabled ? (
               <Bell size={17} className="text-primary flex-shrink-0" />
             ) : (
               <BellOff size={17} className="text-muted-foreground flex-shrink-0" />
             )}
             <span className={notificationsEnabled ? "text-foreground" : "text-muted-foreground"}>Alerts</span>
          </div>
          <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-secondary border border-border'}`}>
             <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {/* Logout */}
      <div className="px-3 py-2 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
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
            
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full hidden sm:inline-block">Admin</span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
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
