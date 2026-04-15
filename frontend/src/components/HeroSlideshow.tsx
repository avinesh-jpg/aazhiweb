import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Use placeholder images from placeholder service
const slides = [
  { 
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&h=800&fit=crop", 
    heading: "Explore a World of Tiny Delights", 
    sub: "Organic baby clothing & essentials, crafted with love", 
    cta: "Shop Now", 
    link: "#collections" 
  },
  { 
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1200&h=800&fit=crop", 
    heading: "No Itchy Tags, Just Happy Wiggles", 
    sub: "Comfy, breathable threads your baby will love", 
    cta: "Shop Clothing", 
    link: "#collections" 
  },
  { 
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1200&h=800&fit=crop", 
    heading: "Hello Mamas! We've Got You Covered", 
    sub: "Everything your newborn needs, all in one place", 
    cta: "Discover Now", 
    link: "#collections" 
  },
];

const HeroSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((n: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent((slides.length + n) % slides.length);
    setTimeout(() => setAnimating(false), 900);
  }, [animating]);

  const next = useCallback(() => go((current + 1) % slides.length), [current, go]);
  const prev = useCallback(() => go((current - 1 + slides.length) % slides.length), [current, go]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "calc(100vh - 112px)", minHeight: 480 }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[900ms]"
          style={{ backgroundImage: `url(${slide.image})`, opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(44,58,53,0.06) 0%, rgba(44,58,53,0.5) 100%)" }} />
          <div className={`relative z-10 h-full flex flex-col items-center justify-center text-center px-6 transition-all duration-700 ${i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-[0.22em] mb-4">{slide.sub}</p>
            <h1 className="text-white font-light max-w-3xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 6vw, 5rem)", lineHeight: 1.1, textShadow: "0 2px 24px rgba(44,58,53,0.3)" }}>
              {slide.heading}
            </h1>
            <a href={slide.link} className="mt-8 px-10 py-3.5 border-2 border-white text-white text-[0.72rem] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-foreground transition-all duration-300">
              {slide.cta}
            </a>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/15 border border-white/40 rounded-full text-white hover:bg-white/30 transition-all backdrop-blur-sm">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/15 border border-white/40 rounded-full text-white hover:bg-white/30 transition-all backdrop-blur-sm">
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full border border-white/70 transition-all duration-300 ${i === current ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlideshow;