import { User, MapPin, Phone, Mail, ChevronRight, LogIn } from "lucide-react";

const ProfilePage = () => (
  <div className="px-5 pb-32 lg:px-8 lg:pb-16">
    <h2 className="font-display text-lg font-bold text-foreground mb-5 lg:text-xl">Profile</h2>

    {/* Guest state */}
    <div className="bg-card border border-border rounded-2xl p-6 text-center mb-6">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
        <User size={32} className="text-primary" />
      </div>
      <h3 className="font-display text-base font-bold text-foreground mb-1">Welcome, Guest</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Sign in to track orders and save your favorites.
      </p>
      <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl gold-glow hover:brightness-110 active:scale-[0.98] transition-all">
        <LogIn size={16} />
        Sign In
      </button>
    </div>

    {/* Info cards */}
    <div className="space-y-3">
      {[
        { icon: MapPin, label: "Delivery Address", value: "Lokoja, Kogi State" },
        { icon: Phone, label: "Phone", value: "Not set" },
        { icon: Mail, label: "Email", value: "Not set" },
      ].map((item) => (
        <button
          key={item.label}
          className="flex items-center gap-4 w-full bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <item.icon size={18} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
            <p className="text-sm text-foreground font-medium">{item.value}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

export default ProfilePage;
