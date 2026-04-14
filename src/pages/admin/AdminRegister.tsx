import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChefHat, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Verify email is in admin_roles first
    const { data: roleCheck, error: roleError } = await supabase
      .from("admin_roles")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (roleError || !roleCheck) {
      setError("This email is not authorized for admin access. Please contact the super admin.");
      setLoading(false);
      return;
    }

    // 2. Sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      // If user already exists, maybe they just need to log in
      if (signUpError.message.includes("already registered")) {
        setError("This account is already registered. Please go to Login.");
      } else {
        setError(signUpError.message);
      }
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-secondary/10 p-8 rounded-3xl border border-border/50 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Registration Successful</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Your admin account has been created.
          </p>
          <a
            href="/admin/login"
            className="block w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-secondary/10 p-8 rounded-3xl border border-border/50 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4 animate-in zoom-in duration-500">
            <ChefHat size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register your staff account
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-xl mb-6">
            <ShieldAlert size={16} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
              placeholder="e.g. staff@eatery.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 mt-6 gold-glow"
          >
            {loading ? (
              <div className="w-5 h-5 mx-auto border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
