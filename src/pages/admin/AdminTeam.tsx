import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Trash2, Shield, ChefHat, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/components/admin/ProtectedRoute";
import { Navigate } from "react-router-dom";

type AdminRole = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

const AdminTeam = () => {
  const { role } = useAdmin();
  const [team, setTeam] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("order_admin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeam = async () => {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTeam(data as AdminRole[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (role !== "superadmin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim()) return;
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a temporary Supabase client to sign up the new user 
      // without logging out the current superadmin
      const { createClient } = await import("@supabase/supabase-js");
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );

      // 1. Sign up the user in Auth
      const { error: signUpError } = await tempSupabase.auth.signUp({
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
           // We can still proceed to add them to admin_roles if they exist, or just fail
           toast.error("This user is already registered. Trying to assign role...");
        } else {
           toast.error(signUpError.message);
           setIsSubmitting(false);
           return;
        }
      }

      // 2. Add to admin_roles
      const { error } = await supabase
        .from("admin_roles")
        .insert([{ email: newEmail.trim().toLowerCase(), role: newRole }]);

      if (error) {
        if (error.code === '23505') {
           toast.error("This email is already registered as an admin.");
        } else {
           toast.error("Failed to add team member role.");
        }
        setIsSubmitting(false);
        return;
      }

      toast.success("Team member added successfully! They can now log in.");
      setNewEmail("");
      setNewPassword("");
      fetchTeam();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email}? They will lose all admin access immediately.`)) return;

    const { error } = await supabase.from("admin_roles").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove member.");
    } else {
      toast.success("Member removed.");
      fetchTeam();
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "superadmin": return <Shield size={16} className="text-purple-500" />;
      case "menu_admin": return <ChefHat size={16} className="text-amber-500" />;
      case "order_admin": default: return <ShoppingBag size={16} className="text-blue-500" />;
    }
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case "superadmin": return "Super Admin";
      case "menu_admin": return "Menu Manager";
      case "order_admin": default: return "Order Processor";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Team Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add, remove, and manage role-based access for your staff.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ADD STAFF FORM */}
        <div className="lg:col-span-1">
          <div className="glass-strong rounded-2xl p-5 border border-border/50 sticky top-24">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <UserPlus size={16} className="text-primary" />
              Invite Team Member
            </h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="staff@eatery.com"
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                >
                  <option value="order_admin">Order Processor (Orders only)</option>
                  <option value="menu_admin">Menu Manager (Menu & Featured)</option>
                  <option value="superadmin">Super Admin (Full Access)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center h-10"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  "Add Member"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* STAFF LIST */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="text-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : team.length === 0 ? (
            <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-border/50">
               <p className="text-muted-foreground text-sm">No team members found.</p>
            </div>
          ) : (
            team.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{getRoleLabel(member.role)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(member.id, member.email)}
                  className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                  title="Remove Access"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTeam;
