import { DollarSign, Moon, Globe, Bell } from "lucide-react";

const TopBar = () => (
  <div className="flex items-center justify-between px-5 py-3">
    <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      Cravings Spot
    </span>
    <div className="flex items-center gap-4">
      {[DollarSign, Moon, Globe, Bell].map((Icon, i) => (
        <button key={i} className="text-muted-foreground hover:text-primary transition-colors">
          <Icon size={16} />
        </button>
      ))}
    </div>
  </div>
);

export default TopBar;
