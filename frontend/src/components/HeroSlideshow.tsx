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
  const [isMobile, setIsMobile] = useState(false);
  const preloadRef = useRef<HTMLImageElement | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile for optimized loading
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // CRITICAL: Preload first image immediately on mount with high priority
  useEffect(() => {
    // Method 1: Preload link in head
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = slides[0].image;
    link.fetchPriority = 'high';
    document.head.appendChild(link);

    // Method 2: Image object preload
    const img = new Image();
    img.src = slides[0].image;
    img.fetchPriority = "high";
    img.onload = () => {
      setImagesLoaded(prev => ({ ...prev, [0]: true }));
      setFirstImageLoaded(true);
    };
    img.onerror = () => {
      // Fallback: mark as loaded even if error to prevent blocking
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
      if (link.parentNode) {
        link.parentNode.removeChild(link);
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
        backgroundColor: "#1a1a2e",
        // Mobile optimization
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {slides.map((slide, i) => {
        const isActive = i === current;
        const isLoaded = imagesLoaded[i] || (i === 0 && firstImageLoaded);
        
        // CRITICAL FIX: First slide is ALWAYS visible initially
        // This ensures LCP image is painted immediately
        const shouldBeVisible = isActive || (i === 0 && !firstImageLoaded);
        
        // For first slide, always show with opacity 1
        // For other slides, control with opacity
        const imageOpacity = (i === 0 && !firstImageLoaded) ? 1 : (isActive ? 1 : 0);
        const contentOpacity = (i === 0 && !firstImageLoaded) ? 1 : (isActive && isLoaded ? 1 : 0);
        const contentTransform = (i === 0 && !firstImageLoaded) ? 'translateY(0)' : (isActive && isLoaded ? 'translateY(0)' : 'translateY(8px)');
        
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{ 
              opacity: shouldBeVisible ? 1 : 0,
              zIndex: isActive ? 10 : 1,
              transition: i === 0 && !firstImageLoaded ? 'none' : 'opacity 700ms ease-in-out',
              visibility: 'visible',
              pointerEvents: isActive ? 'auto' : 'none',
              width: '100%',
              height: '100%',
              // Mobile optimization
              willChange: 'opacity'
            }}
          >
            {/* LCP IMAGE - Always rendered with correct opacity */}
            <img
              src={slide.image}
              alt={slide.heading}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              // CRITICAL: First image starts with opacity 1, NOT 0
              style={{
                opacity: imageOpacity,
                transition: i === 0 && !firstImageLoaded ? 'none' : 'opacity 700ms ease-in-out',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                // Mobile optimization
                willChange: 'opacity',
                // Prevent FOUC
                backgroundColor: '#1a1a2e'
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

            {/* Gradient Overlay - Optimized for mobile */}
            <div 
              className="absolute inset-0" 
              style={{ 
                background: isMobile 
                  ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(96, 165, 250, 0.25) 50%, rgba(0, 0, 0, 0.4) 100%)"
                  : "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(96, 165, 250, 0.2) 50%, rgba(0, 0, 0, 0.3) 100%)",
                opacity: imageOpacity,
                transition: i === 0 && !firstImageLoaded ? 'none' : 'opacity 700ms ease-in-out'
              }} 
            />
            
            {/* Content - Optimized for mobile */}
            <div 
              className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-6"
              style={{
                opacity: contentOpacity,
                transform: contentTransform,
                transition: i === 0 && !firstImageLoaded ? 'none' : 'opacity 700ms ease-in-out, transform 700ms ease-in-out',
                position: 'relative',
                width: '100%',
                height: '100%',
                // Mobile optimization
                willChange: 'opacity, transform'
              }}
            >
              <p className="text-purple-200/90 text-[10px] md:text-xs font-semibold uppercase tracking-[0.22em] mb-3 md:mb-4 animate-pulse-slow">
                {slide.sub}
              </p>
              <h1 
                className="text-white font-light max-w-3xl drop-shadow-lg px-2" 
                style={{ 
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: isMobile ? "clamp(1.8rem, 8vw, 2.8rem)" : "clamp(2.2rem, 6vw, 5rem)",
                  lineHeight: 1.1,
                  textShadow: "0 2px 24px rgba(139, 92, 246, 0.2)",
                  wordBreak: 'break-word'
                }}
              >
                {slide.heading}
              </h1>
              
              <a
                href={slide.link}
                className="group mt-6 md:mt-8 px-6 md:px-10 py-2.5 md:py-3.5 border-2 border-white/80 text-white text-[0.65rem] md:text-[0.72rem] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent hover:scale-105 hover:shadow-purple-500/30"
                style={{
                  display: 'inline-block',
                  minWidth: isMobile ? '100px' : '120px',
                  textAlign: 'center',
                  transition: 'all 300ms ease-in-out',
                  // Mobile optimization
                  touchAction: 'manipulation'
                }}
              >
                <span className="transition-colors duration-300 group-hover:text-black">
                  {slide.cta}
                </span>
              </a>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows - Hide on mobile */}
      {firstImageLoaded && !isMobile && (
        <>
          <button 
            onClick={prev} 
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm border border-purple-300/40 rounded-full text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent transition-all duration-300 hover:scale-110"
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

      {/* Dots - Optimized for mobile */}
      {firstImageLoaded && (
        <div 
          className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 md:gap-2.5"
          style={{
            position: 'absolute',
            bottom: isMobile ? '16px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: isMobile ? '12px' : '16px',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '10px'
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
              className={`rounded-full transition-all duration-300 ${
                i === current 
                  ? "bg-gradient-to-r from-purple-400 to-blue-400 shadow-md" 
                  : "bg-white/40 hover:bg-purple-300/60"
              }`}
              style={{
                transition: 'all 300ms',
                flexShrink: 0,
                width: i === current ? (isMobile ? '20px' : '28px') : (isMobile ? '6px' : '10px'),
                height: isMobile ? '6px' : '10px',
                borderRadius: '9999px',
                minWidth: i === current ? (isMobile ? '20px' : '28px') : (isMobile ? '6px' : '10px')
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

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

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .hero-title {
            font-size: clamp(1.8rem, 8vw, 2.8rem) !important;
          }
          
          .hero-cta {
            min-width: 100px !important;
            padding: 0.625rem 1.5rem !important;
            font-size: 0.65rem !important;
          }
        }

        /* Prevent white flash */
        img {
          display: block;
          max-width: 100%;
          height: auto;
          background-color: #1a1a2e;
        }
      `}</style>
    </div>
  );
};

export default HeroSlideshow;