import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import colSwaddles from "@/assets/col-swaddles.jpg";
import colBooties from "@/assets/col-booties.jpg";

const ThottilHighlight = () => (
  <section className="bg-foreground py-20 md:py-28 px-4 sm:px-8 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(90,138,110,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
    <div className="max-w-[1320px] mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
      <div className="reveal">
        <span className="block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-1">Traditional & Reimagined</span>
        <h2 className="text-white font-light text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          The Aazhi<br />Thottil
        </h2>
        <p className="text-white/60 text-[0.9rem] leading-relaxed mb-4">
          Crafted from the finest organic muslin, our Thottil collection blends timeless South Indian tradition with modern safety and style. Gentle on delicate skin, designed for restful sleep.
        </p>
        <p className="text-white/60 text-[0.9rem] leading-relaxed mb-8">
          Each Thottil is thoughtfully designed to support your baby's natural movement while keeping them snugly cocooned in comfort and love.
        </p>
        <Link 
          to="/category/collection/thottil"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 border-2 border-primary text-primary text-[0.72rem] font-bold uppercase tracking-[0.16em] hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-sm"
        >
          Explore Thottil Collection <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 reveal reveal-d2">
        <div className="rounded-xl overflow-hidden mt-8">
          <img src={colSwaddles} alt="Thottil" className="w-full object-cover" style={{ aspectRatio: "2/3" }} />
        </div>
        <div className="rounded-xl overflow-hidden">
          <img src={colBooties} alt="Thottil Kit" className="w-full object-cover" style={{ aspectRatio: "2/3" }} />
        </div>
      </div>
    </div>
  </section>
);

export default ThottilHighlight;