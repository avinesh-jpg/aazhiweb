import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "../assets/new banner 1.png";
import banner2 from "../assets/new banner 2.png";
import banner3 from "../assets/new banner 3.png";

const slides = [
  { 
    image: banner1,
    heading: "Premium Tiruppur Cotton Kids Wear.", 
    cta: "Shop Now", 
    link: "#collections" 
  },
  { 
    image: banner2,
    heading: "Made for Play, Priced for Parents.",  
    cta: "Shop Now", 
    link: "#collections" 
  },
  { 
    image: banner3,
    heading: "No Itchy Tags, Just Happy Wiggles.",  
    cta: "Shop Now", 
    link: "#collections" 
  },
];

const HeroSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        // FIXED: Changed from #1a1a2e to a warm cream color that matches banner1
        backgroundColor: "#f5f0eb",
        // FIXED: Added banner1 as CSS background for instant display
        backgroundImage: `url(${banner1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* ⭐⭐⭐ LCP FIX: STATIC FIRST SLIDE - Always in HTML for immediate discovery ⭐⭐⭐ */}
      <div 
        className="absolute inset-0" 
        style={{ 
          zIndex: current === 0 ? 10 : 0,
          opacity: current === 0 ? 1 : 0,
          transition: 'opacity 700ms ease-in-out',
          pointerEvents: current === 0 ? 'auto' : 'none'
        }}
      >
        {/* LCP Image - Discoverable immediately in HTML */}
        <img
          src={slides[0].image}
          alt={slides[0].heading}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            opacity: 1
          }}
          width="100%"
          height="100%"
          onLoad={() => {
            setImagesLoaded(prev => ({ ...prev, [0]: true }));
            setFirstImageLoaded(true);
          }}
          onError={() => {
            setImagesLoaded(prev => ({ ...prev, [0]: true }));
            setFirstImageLoaded(true);
          }}
        />

        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(96, 165, 250, 0.2) 50%, rgba(0, 0, 0, 0.3) 100%)",
            opacity: 1,
            transition: 'opacity 700ms ease-in-out'
          }} 
        />
        
        {/* Content */}
        <div 
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
          style={{
            opacity: current === 0 ? 1 : 0,
            transform: current === 0 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 700ms ease-in-out, transform 700ms ease-in-out',
            position: 'relative',
            width: '100%',
            height: '100%'
          }}
        >
        
          <h1 
            className="text-white font-light max-w-3xl drop-shadow-lg" 
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 6vw, 5rem)",
              lineHeight: 1.1,
              color: "#fff",
              WebkitTextStroke: "0.8px rgba(255, 255, 255, 0.7)",
              textShadow: `
                0 2px 3px rgba(0, 0, 0, 2),
                0 5px 15px rgba(0, 0, 0, 2)
              `,
              wordBreak: "break-word"
            }}
          >
            {slides[0].heading}
          </h1>
          <a
            href={slides[0].link}
            className="mt-8 px-10 py-3.5 border-2 border-white/80 text-white text-[0.72rem] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent hover:text-black hover:scale-105 hover:shadow-purple-500/30"
            style={{
              display: 'inline-block',
              minWidth: '120px',
              textAlign: 'center',
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
            {slides[0].cta}
          </a>
        </div>
      </div>

      {/* Dynamic Slides (2 & 3) */}
      {slides.slice(1).map((slide, i) => {
        const slideIndex = i + 1;
        const isActive = current === slideIndex;
        const isLoaded = imagesLoaded[slideIndex] || false;
        
        return (
          <div
            key={slideIndex}
            className="absolute inset-0"
            style={{ 
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 10 : 1,
              transition: 'opacity 700ms ease-in-out',
              visibility: 'visible',
              pointerEvents: isActive ? 'auto' : 'none',
              width: '100%',
              height: '100%'
            }}
          >
            <img
              src={slide.image}
              alt={slide.heading}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              fetchPriority="low"
              decoding="async"
              style={{
                opacity: isActive ? 1 : 0,
                transition: 'opacity 700ms ease-in-out',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
              width="100%"
              height="100%"
              onLoad={() => {
                setImagesLoaded(prev => ({ ...prev, [slideIndex]: true }));
              }}
              onError={() => {
                setImagesLoaded(prev => ({ ...prev, [slideIndex]: true }));
              }}
            />

            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0" 
              style={{ 
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(96, 165, 250, 0.2) 50%, rgba(0, 0, 0, 0.3) 100%)",
                opacity: isActive ? 1 : 0,
                transition: 'opacity 700ms ease-in-out'
              }} 
            />
            
            {/* Content */}
            <div 
              className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
              style={{
                opacity: isActive && isLoaded ? 1 : 0,
                transform: isActive && isLoaded ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 700ms ease-in-out, transform 700ms ease-in-out',
                position: 'relative',
                width: '100%',
                height: '100%'
              }}
            >
          
              <h1 
                className="text-white font-light max-w-3xl drop-shadow-lg" 
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2.2rem, 6vw, 5rem)",
                  lineHeight: 1.1,
                  color: "#fff",
                  WebkitTextStroke: "0.8px rgba(255, 255, 255, 0.7)",
                  textShadow: `
                    0 2px 3px rgba(0, 0, 0, 2),
                    0 5px 15px rgba(0, 0, 0, 2)
                  `,
                  wordBreak: "break-word"
                }}
              >
                {slide.heading}
              </h1>
              <a
                href={slide.link}
                className="mt-8 px-10 py-3.5 border-2 border-white/80 text-white text-[0.72rem] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent hover:text-black hover:scale-105 hover:shadow-purple-500/30"
                style={{
                  display: 'inline-block',
                  minWidth: '120px',
                  textAlign: 'center',
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

      {/* Navigation Arrows - Only show after first image loads */}
      {firstImageLoaded && (
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

      {/* Dots */}
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
            gap: '10px'
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
                  ? "w-7 h-2.5 bg-gradient-to-r from-purple-400 to-blue-400 shadow-md" 
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-purple-300/60"
              }`}
              style={{
                transition: 'all 300ms',
                flexShrink: 0,
                minWidth: i === current ? '28px' : '10px',
                height: '10px',
                borderRadius: '9999px'
              }}
            />
          ))}
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