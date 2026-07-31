import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "../assets/banner1-optimized.webp";
import banner2 from "../assets/banner2-optimized.webp";
import banner3 from "../assets/banner3-optimized.webp";

const slides = [
  { 
    image: banner1,
    heading: "Premium Tiruppur Cotton Kids Wear. Made for Play, Priced for Parents.", 
    sub: "Direct from the textile capital of India to your doorstep. Discover unbeatable value-for-money clothing from Tiruppur's finest hidden brands.", 
    cta: "Shop Now", 
    link: "#collections" 
  },
  { 
    image: banner2,
    heading: "No Itchy Tags, Just Happy Wiggles", 
    sub: "Comfy, breathable threads your baby will love", 
    cta: "Shop Now", 
    link: "#collections" 
  },
  { 
    image: banner3,
    heading: "Hello Mamas! We've Got You Covered", 
    sub: "Everything your newborn needs, all in one place", 
    cta: "Shop Now", 
    link: "#collections" 
  },
];

const HeroSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const preloadRef = useRef<HTMLImageElement | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preload first image immediately on mount
  useEffect(() => {
    const img = new Image();
    img.src = slides[0].image;
    img.fetchPriority = "high";
    img.onload = () => {
      setImagesLoaded(prev => ({ ...prev, [0]: true }));
      setFirstImageLoaded(true);
    };
    img.onerror = () => {
      setImagesLoaded(prev => ({ ...prev, [0]: true }));
      setFirstImageLoaded(true);
    };
    preloadRef.current = img;

    return () => {
      if (preloadRef.current) {
        preloadRef.current.onload = null;
        preloadRef.current.onerror = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Preload adjacent images
  useEffect(() => {
    const preloadAdjacent = (index: number) => {
      const nextIndex = (index + 1) % slides.length;
      const prevIndex = (index - 1 + slides.length) % slides.length;
      
      [nextIndex, prevIndex].forEach(idx => {
        if (!imagesLoaded[idx]) {
          const img = new Image();
          img.src = slides[idx].image;
          img.fetchPriority = "low";
          img.onload = () => {
            setImagesLoaded(prev => ({ ...prev, [idx]: true }));
          };
          img.onerror = () => {
            setImagesLoaded(prev => ({ ...prev, [idx]: true }));
          };
        }
      });
    };

    if (firstImageLoaded) {
      preloadAdjacent(current);
    }
  }, [current, firstImageLoaded, imagesLoaded]);

  const go = useCallback((n: number) => {
    if (animating || !firstImageLoaded) return;
    setAnimating(true);
    const newIndex = (slides.length + n) % slides.length;
    
    // Preload new adjacent images
    const nextIndex = (newIndex + 1) % slides.length;
    const prevIndex = (newIndex - 1 + slides.length) % slides.length;
    [nextIndex, prevIndex].forEach(idx => {
      if (!imagesLoaded[idx]) {
        const img = new Image();
        img.src = slides[idx].image;
        img.fetchPriority = "low";
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [idx]: true }));
        };
        img.onerror = () => {
          setImagesLoaded(prev => ({ ...prev, [idx]: true }));
        };
      }
    });
    
    timeoutRef.current = setTimeout(() => {
      setCurrent(newIndex);
      setTimeout(() => setAnimating(false), 700);
    }, 50);
    
  }, [animating, firstImageLoaded, imagesLoaded]);

  const next = useCallback(() => {
    if (!firstImageLoaded) return;
    go((current + 1) % slides.length);
  }, [current, go, firstImageLoaded]);

  const prev = useCallback(() => {
    if (!firstImageLoaded) return;
    go((current - 1 + slides.length) % slides.length);
  }, [current, go, firstImageLoaded]);

  // Auto-advance
  useEffect(() => {
    if (!firstImageLoaded) return;
    
    const t = setInterval(() => {
      if (!animating) {
        next();
      }
    }, 5500);
    
    return () => clearInterval(t);
  }, [next, animating, firstImageLoaded]);

  return (
    <div 
      ref={slideContainerRef}
      className="relative w-full overflow-hidden" 
      style={{ 
        height: "calc(100vh - 112px)", 
        minHeight: 480,
        // CLS FIX: Reserve space to prevent layout shift
        backgroundColor: "#1a1a2e"
      }}
    >
      {slides.map((slide, i) => {
        const isActive = i === current;
        const isLoaded = imagesLoaded[i] || (i === 0 && firstImageLoaded);
        const shouldBeVisible = isActive || (i === 0 && !firstImageLoaded);
        const opacity = shouldBeVisible ? 1 : 0;
        
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{ 
              opacity: opacity,
              zIndex: isActive ? 10 : 1,
              transition: 'opacity 700ms ease-in-out',
              visibility: 'visible',
              pointerEvents: isActive ? 'auto' : 'none',
              // CLS FIX: Ensure consistent sizing
              width: '100%',
              height: '100%'
            }}
          >
            {/* CLS FIX: Image with explicit dimensions */}
            <img
              src={slide.image}
              alt={slide.heading}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              // CLS FIX: Image has fixed dimensions
              width="100%"
              height="100%"
              style={{
                opacity: shouldBeVisible ? 1 : 0,
                transition: 'opacity 700ms ease-in-out',
                // CLS FIX: Prevent image from causing shift
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
              onLoad={() => {
                if (!imagesLoaded[i]) {
                  setImagesLoaded(prev => ({ ...prev, [i]: true }));
                  if (i === 0) setFirstImageLoaded(true);
                }
              }}
              onError={() => {
                setImagesLoaded(prev => ({ ...prev, [i]: true }));
                if (i === 0) setFirstImageLoaded(true);
              }}
            />

            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0" 
              style={{ 
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(96, 165, 250, 0.2) 50%, rgba(0, 0, 0, 0.3) 100%)",
                opacity: shouldBeVisible ? 1 : 0,
                transition: 'opacity 700ms ease-in-out'
              }} 
            />
            
            {/* CLS FIX: Content with fixed positioning */}
            <div 
              className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
              style={{
                opacity: shouldBeVisible && (i === 0 ? true : isLoaded) ? 1 : 0,
                transform: shouldBeVisible && (i === 0 ? true : isLoaded) ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 700ms ease-in-out, transform 700ms ease-in-out',
                // CLS FIX: Prevent content from causing shift
                position: 'relative',
                width: '100%',
                height: '100%'
              }}
            >
              <p className="text-purple-200/90 text-xs font-semibold uppercase tracking-[0.22em] mb-4 animate-pulse-slow">
                {slide.sub}
              </p>
              <h1 
                className="text-white font-light max-w-3xl drop-shadow-lg" 
                style={{ 
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2.2rem, 6vw, 5rem)",
                  lineHeight: 1.1,
                  textShadow: "0 2px 24px rgba(139, 92, 246, 0.2)",
                  // CLS FIX: Prevent text from causing shift
                  wordBreak: 'break-word'
                }}
              >
                {slide.heading}
              </h1>
              <a
  href={slide.link}
  className="mt-8 px-10 py-3.5 border-2 border-white/80 text-white text-[0.72rem] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent hover:text-black hover:scale-105 hover:shadow-purple-500/30"
  // CLS FIX: Prevent link from causing shift
  style={{
    display: 'inline-block',
    minWidth: '120px',
    textAlign: 'center',
    // Ensure text color changes on hover
    color: 'white',
    transition: 'all 300ms ease-in-out'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = 'black';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = 'white';
  }}
>
  {slide.cta}
</a>
              
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows - CLS Optimized */}
      {firstImageLoaded && (
        <>
          <button 
            onClick={prev} 
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm border border-purple-300/40 rounded-full text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent transition-all duration-300 hover:scale-110"
            // CLS FIX: Fixed position, won't shift
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              margin: 0
            }}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button 
            onClick={next} 
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm border border-purple-300/40 rounded-full text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent transition-all duration-300 hover:scale-110"
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              margin: 0
            }}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Dots - CLS & Animation Optimized */}
{firstImageLoaded && (
  <div 
    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5"
    style={{
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      // CLS FIX: Prevent dot container from shifting
      pointerEvents: 'none'
    }}
  >
    {slides.map((_, i) => {
      const isActive = i === current;
      return (
        <button
          key={i}
          onClick={() => go(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={isActive ? "true" : undefined}
          className="rounded-full transition-all duration-300"
          // CLS FIX: Use fixed size, animate with transform + opacity
          style={{
            width: '10px',
            height: '10px',
            minWidth: '10px', // Keep consistent size
            flexShrink: 0,
            borderRadius: '9999px',
            // Use transform for width changes (composited)
            transform: isActive ? 'scaleX(2.8)' : 'scaleX(1)',
            // Use opacity for active state (composited)
            opacity: isActive ? 1 : 0.4,
            // Use background gradient for active (composited)
            background: isActive 
              ? 'linear-gradient(135deg, #a78bfa, #60a5fa)' 
              : 'rgba(255, 255, 255, 0.4)',
            // Composited transition
            transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), background 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            // Pointer events only for buttons
            pointerEvents: 'auto',
            // CLS FIX: No box-shadow animation
            boxShadow: isActive ? '0 0 20px rgba(167, 139, 250, 0.3)' : 'none',
          }}
        />
      );
    })}
  </div>
)}

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

        // CLS FIX: Prevent font from causing layout shift
        @font-face {
          font-family: 'Cormorant Garamond';
          font-display: swap;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        // CLS FIX: Prevent images from causing layout shift
        img {
          display: block;
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default HeroSlideshow;