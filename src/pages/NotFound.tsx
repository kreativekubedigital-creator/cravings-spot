import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, Utensils } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full" />
          <div className="relative glass-strong w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils size={40} className="text-primary animate-bounce-slow" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-bold font-display text-primary tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Lost in the sauce?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mx-auto max-w-[280px]">
            We couldn't find the page you're looking for. It might have been moved or eaten.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Home size={18} />
          Back to Kitchen
        </button>
      </div>
    </div>
  );
};

export default NotFound;
