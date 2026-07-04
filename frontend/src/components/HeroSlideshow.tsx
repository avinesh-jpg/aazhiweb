import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "../assets/banner1.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.1.png"; // Add this import for the third banner

// Use placeholder images from placeholder service
const slides = [
  { 
    image: banner1,//https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&h=800&fit=crop 
    heading: "Premium Tiruppur Cotton Kids Wear. Made for Play, Priced for Parents.", 
    sub: "Direct from the textile capital of India to your doorstep. Discover unbeatable value-for-money clothing from Tiruppur’s finest hidden brands.", 
    cta: "Shop Now", 
    link: "#collections" 
  },
  { 
    image: banner2,//https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1200&h=800&fit=crop 
    heading: "No Itchy Tags, Just Happy Wiggles", 
    sub: "Comfy, breathable threads your baby will love", 
    cta: "Shop Clothing", 
    link: "#collections" 
  },
  { 
    image: banner3,//https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1200&h=800&fit=crop 
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
          {/* Gradient Overlay - Updated to purple/blue theme */}
          <div className="absolute inset-0" style={{ 
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(96, 165, 250, 0.25) 50%, rgba(0, 0, 0, 0.3) 100%)" 
          }} />
          
          <div className={`relative z-10 h-full flex flex-col items-center justify-center text-center px-6 transition-all duration-700 ${i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-purple-200/90 text-xs font-semibold uppercase tracking-[0.22em] mb-4 animate-pulse-slow">
              {slide.sub}
            </p>
            <h1 className="text-white font-light max-w-3xl drop-shadow-lg" style={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              fontSize: "clamp(2.2rem, 6vw, 5rem)", 
              lineHeight: 1.1, 
              textShadow: "0 2px 24px rgba(139, 92, 246, 0.3)" 
            }}>
              {slide.heading}
            </h1>
            <a 
              href={slide.link} 
              className="mt-8 px-10 py-3.5 border-2 border-white/80 text-white text-[0.72rem] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent hover:scale-105 hover:shadow-purple-500/30"
            >
              {slide.cta}
            </a>
          </div>
        </div>
      ))}

      {/* Arrows - Updated with purple/blue theme */}
      <button 
        onClick={prev} 
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm border border-purple-300/40 rounded-full text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={next} 
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm border border-purple-300/40 rounded-full text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent transition-all duration-300 hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots - Updated with purple/blue theme */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current 
                ? "w-7 h-2.5 bg-gradient-to-r from-purple-400 to-blue-400 shadow-md" 
                : "w-2.5 h-2.5 bg-white/40 hover:bg-purple-300/60"
            }`}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.9;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroSlideshow;
