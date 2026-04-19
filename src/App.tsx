import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import OrdersPage from "./pages/OrdersPage";
import CheckoutPage from "./pages/CheckoutPage";
import ThankYouPage from "./pages/ThankYouPage";
import FeaturedPage from "./pages/FeaturedPage";
import NotFound from "./pages/NotFound";
import DesktopNav from "@/components/DesktopNav";
import BottomNav from "@/components/BottomNav";
import HeroBanner from "@/components/HeroBanner";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "react-router-dom";
import { useState } from "react";

// Admin imports
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminFeatured from "./pages/admin/AdminFeatured";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute, { RoleRestricted } from "@/components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const AppLayout = () => {
  const cart = useCart();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isCheckout = location.pathname === "/checkout";
  const isThankYou = location.pathname === "/thank-you";
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!isHome && <DesktopNav />}

      <div className={!isHome ? "lg:ml-64" : ""}>
        <div className={!isHome ? "max-w-6xl mx-auto" : ""}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/menu"
              element={
                <>
                  <HeroBanner />
                  <MenuPage cart={cart} />
                </>
              }
            />
            <Route
              path="/orders"
              element={
                <>
                  <HeroBanner compact />
                  <OrdersPage cart={cart} />
                </>
              }
            />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/featured" element={<FeaturedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>

      {!isHome && !isCheckout && !isThankYou && (
        <BottomNav onCartOpen={() => setCartOpen(true)} cartCount={cart.totalItems} />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        totalPrice={cart.totalPrice}
        onUpdateQty={cart.updateQuantity}
        onRemove={cart.removeItem}
      />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Admin routes — separate from main layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={
                <RoleRestricted allowedRoles={["superadmin", "cravings_admin", "order_admin", "menu_admin"]}>
                  <AdminDashboard />
                </RoleRestricted>
              } />
              <Route path="orders" element={
                <RoleRestricted allowedRoles={["superadmin", "cravings_admin", "order_admin"]}>
                  <AdminOrders />
                </RoleRestricted>
              } />
              <Route path="featured" element={
                <RoleRestricted allowedRoles={["superadmin", "cravings_admin", "menu_admin"]}>
                  <AdminFeatured />
                </RoleRestricted>
              } />
              <Route path="menu" element={
                <RoleRestricted allowedRoles={["superadmin", "cravings_admin", "menu_admin"]}>
                  <AdminMenu />
                </RoleRestricted>
              } />
              <Route path="analytics" element={
                <RoleRestricted allowedRoles={["superadmin", "cravings_admin"]}>
                  <AdminAnalytics />
                </RoleRestricted>
              } />
              <Route path="team" element={
                <RoleRestricted allowedRoles={["superadmin", "cravings_admin"]}>
                  <AdminTeam />
                </RoleRestricted>
              } />
            </Route>
          </Route>

          {/* Customer-facing routes */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
