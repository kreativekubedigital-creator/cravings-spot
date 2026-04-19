import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import heroSplash from "@/assets/hero-splash.jpg";
import logo from "@/assets/logo.png";

const HomePage = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="fixed inset-0 flex flex-col justify-end overflow-hidden overflow-y-hidden touch-none bg-black">
      {/* Full-screen hero image */}
      <img
        src={heroSplash}
        alt="Delicious food from Cravings Spot"
        className="absolute inset-0 w-full h-full object-cover"
        width={1024}
        height={1536}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

      {/* Floating logo */}
      <div className="absolute top-8 left-6 z-10 lg:top-10 lg:left-12">
        <img
          src={logo}
          alt="Cravings Spot"
          className="w-24 h-24 rounded-full object-cover gold-glow lg:w-28 lg:h-28 animate-[gentle-bounce_3s_ease-in-out_infinite]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-8 lg:pb-16 lg:px-12 max-w-2xl lg:max-w-4xl mx-auto w-full">
        {/* Subtle glow behind text to help it pop without a visible box edge */}
        <div className="absolute inset-0 bg-black/60 blur-[120px] -z-10 rounded-full scale-110 lg:scale-125 translate-y-1/4" />
        
        <p className="font-display italic text-primary text-sm tracking-widest mb-2 lg:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {greeting}
        </p>

        <h1 className="font-display text-[2.5rem] sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-4 sm:mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
          From <span className="text-primary gold-text-glow">Jollof</span> to
          Pizza, We've Got Your{" "}
          <span className="text-primary gold-text-glow">Cravings</span>
        </h1>

        <p className="text-sm sm:text-lg text-white/95 max-w-lg mb-8 lg:mb-12 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
          Pancakes, shawarma, egusi soup, grilled chicken & more!{" "}
          <br />
          Freshly made and delivered fast across Lokoja.
        </p>

        {/* CTA button — pill style with animation */}
        <button
          onClick={() => navigate("/menu")}
          className="group relative flex items-center w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-full overflow-hidden hover:bg-white/20 hover:border-primary/50 transition-all shadow-2xl animate-button-pulse"
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>

          <span className="w-12 h-12 z-10" />
          <span className="flex-1 text-center font-bold text-white text-base tracking-wide py-4 uppercase z-10">
            Order Now
          </span>
          <span className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full m-1 group-hover:scale-110 transition-transform z-10 shadow-[0_0_15px_rgba(255,107,0,0.4)]">
            <ChevronRight size={20} className="animate-arrow-glow" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
