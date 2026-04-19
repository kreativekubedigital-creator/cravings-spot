import logo from "@/assets/logo.png";
import { MapPin } from "lucide-react";

interface HeroBannerProps {
  compact?: boolean;
}

const HeroBanner = ({ compact }: HeroBannerProps) => {
  if (compact) {
    return (
      <div className="flex items-center justify-between px-5 pt-4 pb-3 lg:px-8 lg:pt-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Cravings Spot" className="w-12 h-12 rounded-full object-cover lg:hidden" />
          <div>
            <p className="text-[10px] text-muted-foreground">Welcome back</p>
            <p className="text-sm font-semibold text-foreground">Cravings Spot</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4 lg:px-8 lg:pt-6">
      {/* Top bar */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Cravings Spot"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30 shadow-lg mb-1.5"
          />
          <span className="text-[10px] text-muted-foreground">Location</span>
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Lokoja, Kogi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
