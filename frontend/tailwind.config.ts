/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // ⚠️ CRITICAL: Add these if you have them
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/layouts/**/*.{js,jsx}",
    // If you use React Router with lazy loading
    "./src/routes/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        body: ["Nunito Sans", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        // ✅ ADD THESE (from your CSS)
        "float-soft": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "50%": { opacity: ".5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.8s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        // ✅ ADD THESE
        "float": "float-soft 4s ease-in-out infinite",
        "slide-in-down": "slide-in-down 0.25s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      // ✅ ADD THESE (custom utilities from your CSS)
      backgroundImage: {
        'gradient-text': 'linear-gradient(125deg, #8b5cf6, #a78bfa, #60a5fa)',
        'gradient-blob-purple': 'radial-gradient(circle at 25% 35%, rgba(139,92,246,.12), transparent 65%)',
        'gradient-blob-blue': 'radial-gradient(circle at 75% 65%, rgba(96,165,250,.1), transparent 65%)',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow-purple': '0 2px 15px rgba(139,92,246,.25)',
      },
      backdropBlur: {
        'glass': 'blur(8px)',
      },
    },
  },
  plugins: [
    // ✅ ADD THIS for forms (if you use it)
    // require('@tailwindcss/forms'),
  ],
  // ✅ CRITICAL: Safelist all dynamic classes
  safelist: [
    // Animations
    'animate-float',
    'animate-slide-in-down',
    'animate-pulse-slow',
    'animate-shimmer',
    'animate-fade-in',
    'animate-slide-in-right',
    
    // Gradients
    'gradient-text-pb',
    'bg-blob-purple',
    'bg-blob-blue',
    
    // Custom components (if used in JS conditionally)
    'card-glass',
    'input-glass',
    'btn-outline',
    'btn-soft',
    'badge-lavender',
    'hover-shimmer',
    'stat-number',
    'testimonial-quote',
    'wave-divider',
    'text-glow-purple',
    
    // Scrollbar classes
    'scrollbar-thin',
    'scrollbar-track-purple-50',
    'scrollbar-thumb-purple-300',
    
    // Utility classes used dynamically
    'line-clamp-1',
    'line-clamp-2',
    'line-clamp-3',
    'reveal',
    'revealed',
    'reveal-d2',
  ],
  // ✅ Optimize for production
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
}