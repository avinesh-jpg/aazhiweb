import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import colSwaddles from "@/assets/col-swaddles.jpg";
import colBooties from "@/assets/col-booties.jpg";

const ThottilHighlight = () => (
  <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-20 md:py-28 px-4 sm:px-8 relative overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ 
      background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(96, 165, 250, 0.08) 50%, transparent 70%)", 
      transform: "translate(30%, -30%)" 
    }} />
    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full" style={{ 
      background: "radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)", 
      transform: "translate(-20%, 30%)" 
    }} />
    
    {/* Animated floating particles */}
    <div className="absolute top-1/4 left-10 w-2 h-2 bg-purple-400/40 rounded-full animate-float-slow"></div>
    <div className="absolute bottom-1/3 right-20 w-3 h-3 bg-blue-400/30 rounded-full animate-float-slow animation-delay-1000"></div>
    <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-300/30 rounded-full animate-float-slow animation-delay-2000"></div>
    
    <div className="max-w-[1320px] mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
      {/* Content Section */}
      <div className="reveal">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] mb-1 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Why Smart Parents Choose Aazhi
        </span>
        <h2 className="text-white font-light text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 drop-shadow-lg" style={{ 
          fontFamily: "'Cormorant Garamond', serif" 
        }}>
          Direct from<br />Tiruppur Hub
        </h2>
        <p className="text-white/70 text-[0.9rem] leading-relaxed mb-4">
          We source directly from the legendary factories and offline outlets of Tiruppur, Tamil Nadu. No middleman markups—just pure, export-grade quality.
        </p>
        <p className="text-white/70 text-[0.9rem] leading-relaxed mb-4">
          100% Premium Cotton. Children's skin deserves the best. Our curated collections feature ultra-soft, breathable, and durable fabrics designed to withstand endless playtime and washes.
        </p>
        <p className="text-white/70 text-[0.9rem] leading-relaxed mb-8">
          Unbeatable Value for Money. Get premium brand-quality garments at a fraction of high-street retail prices. We unlock Tiruppur's surplus market for families nationwide.
        </p>
        <Link 
          to="/category/collection/thottil"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-white text-[0.72rem] uppercase tracking-[0.16em] transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-purple-500/30 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400"
        >
          Explore Thottil Collection <ArrowRight size={14} />
        </Link>
      </div>
      
      {/* Images Grid */}
      <div className="grid grid-cols-2 gap-4 reveal reveal-d2">
        <div className="rounded-2xl overflow-hidden mt-8 shadow-xl transition-all duration-500 hover:shadow-purple-500/20 hover:-translate-y-1">
          <img 
            src={colSwaddles} 
            alt="Thottil" 
            className="w-full object-cover transition-transform duration-700 hover:scale-105" 
            style={{ aspectRatio: "2/3" }} 
          />
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-purple-500/20 hover:-translate-y-1">
          <img 
            src={colBooties} 
            alt="Thottil Kit" 
            className="w-full object-cover transition-transform duration-700 hover:scale-105" 
            style={{ aspectRatio: "2/3" }} 
          />
        </div>
      </div>
    </div>

    <style>{`
      @keyframes float-slow {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.3;
        }
        25% {
          transform: translateY(-15px) translateX(5px);
          opacity: 0.6;
        }
        50% {
          transform: translateY(-25px) translateX(0px);
          opacity: 0.4;
        }
        75% {
          transform: translateY(-15px) translateX(-5px);
          opacity: 0.5;
        }
      }
      
      .animate-float-slow {
        animation: float-slow 6s ease-in-out infinite;
      }
      
      .animation-delay-1000 {
        animation-delay: 1s;
      }
      
      .animation-delay-2000 {
        animation-delay: 2s;
      }
    `}</style>
  </section>
);

export default ThottilHighlight;