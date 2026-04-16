import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";

interface AdminContextType {
  session: Session | null;
  role: string | null;
}

export const AdminContext = createContext<AdminContextType>({ session: null, role: null });

export const useAdmin = () => useContext(AdminContext);

const ProtectedRoute = () => {
  const { session, role, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminContext.Provider value={{ session, role }}>
      <Outlet />
    </AdminContext.Provider>
  );
};

export const RoleRestricted = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
  const { role, loading } = useAdmin();
  
  if (loading) return null;
  // If role isn't loaded or isn't in allowed Roles, bounce to dashboard
  if (!role || !allowedRoles.includes(role)) {
    // Check if we are already trying to render dashboard to prevent infinite loop
    if (window.location.pathname === "/admin/dashboard" || window.location.pathname === "/admin/dashboard/") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl">⚠️</div>
          <h2 className="text-xl font-bold text-foreground">Unauthorized Access</h2>
          <p className="text-muted-foreground mt-2 max-w-md">Your current role ({role || "None"}) does not have permission to view the dashboard.</p>
        </div>
      );
    }
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
