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
        <p className="font-display italic text-primary/80 text-sm tracking-wide mb-1 lg:text-base">
          {greeting}
        </p>

        <h1 className="font-display text-[2rem] sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-2 sm:mb-4 drop-shadow-lg">
          From <span className="text-primary gold-text-glow">Jollof</span> to
          Pizza, We've Got Your{" "}
          <span className="text-primary gold-text-glow">Cravings</span>
        </h1>

        <p className="text-xs sm:text-base text-white/70 max-w-md mb-6 lg:mb-10 leading-relaxed drop-shadow-sm">
          Pancakes, shawarma, egusi soup, grilled chicken & more — freshly made and delivered fast across Lokoja.
        </p>

        {/* CTA button — pill style like the reference */}
        <button
          onClick={() => navigate("/menu")}
          className="group flex items-center w-full max-w-sm bg-card/80 backdrop-blur-md border border-border rounded-full overflow-hidden hover:border-primary/40 transition-all"
        >
          <span className="w-12 h-12" />
          <span className="flex-1 text-center font-semibold text-foreground text-sm tracking-wide py-4">
            Start Ordering
          </span>
          <span className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full m-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <ChevronRight size={18} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
