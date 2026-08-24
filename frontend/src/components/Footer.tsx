import React, { useEffect, useRef } from 'react';

// ============================================
// DATA
// ============================================
const shopLinks = [
  { name: "New Born", category: "newborn", path: "/category/collection/newborn" },
  { name: "Girls", category: "Girls", path: "/category/collection/Girls" },
  { name: "Boys", category: "Boys", path: "/category/collection/Boys" },
  { name: "UniSex", category: "UniSex", path: "/category/collection/UniSex" },
  { name: "Womens", category: "Womens", path: "/category/collection/womens" },
];

const companyLinks = [
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
  { name: "Shipping Policy", path: "/ShippingPolicy" },
  { name: "Return Policy", path: "/help/return-policy" },
  { name: "Blogs", path: "/blog" },
];

// ============================================
// INSTAGRAM SVG ICON COMPONENT
// ============================================
const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path 
      d="M17.5 0H6.5C2.91 0 0 2.91 0 6.5V17.5C0 21.09 2.91 24 6.5 24H17.5C21.09 24 24 21.09 24 17.5V6.5C24 2.91 21.09 0 17.5 0ZM12 18C8.686 18 6 15.314 6 12C6 8.686 8.686 6 12 6C15.314 6 18 8.686 18 12C18 15.314 15.314 18 12 18ZM18.5 7C17.671 7 17 6.329 17 5.5C17 4.671 17.671 4 18.5 4C19.329 4 20 4.671 20 5.5C20 6.329 19.329 7 18.5 7Z" 
      fill="currentColor"
    />
    <path 
      d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" 
      fill="currentColor"
    />
  </svg>
);

// ============================================
// ACCESSIBLE INSTAGRAM EMBED COMPONENT
// ============================================
const AccessibleInstagramEmbed = ({ embedId, src, postIndex }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.setAttribute('title', `Instagram post ${postIndex + 1} - Aazhi Clothing`);
    }
  }, [postIndex]);

  return (
    <div 
      className="aspect-square rsme-embed"
      role="figure"
      aria-label={`Instagram post ${postIndex + 1} from Aazhi Clothing`}
    >
      <iframe
        ref={iframeRef}
        id={embedId}
        src={src}
        title={`Instagram post ${postIndex + 1} - Aazhi Clothing`}
        allowTransparency={true}
        allowFullScreen={true}
        frameBorder="0"
        height="657"
        scrolling="no"
        className="instagram-media instagram-media-rendered"
        style={{ 
          width: "calc(100% - 2px)", 
          backgroundColor: "white", 
          borderRadius: "3px",
          border: "none"
        }}
        data-instgrm-payload-id={embedId.replace('instagram-embed-', 'instagram-media-payload-')}
        loading="lazy"
      />
    </div>
  );
};

// ============================================
// ACCESSIBLE NAVIGATION BUTTON COMPONENT
// ============================================
const NavButton = ({ children, onClick, ariaLabel, className = "", delay = "0s" }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`bg-transparent border-0 cursor-pointer transition-all duration-300 hover:translate-x-1 ${className}`}
    style={{ animationDelay: delay }}
  >
    {children}
  </button>
);

// ============================================
// MAIN FOOTER COMPONENT
// ============================================
const Footer = () => {
  const handleNavigation = (path, linkName) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Navigating to: ${path} (${linkName})`);
    }
    window.location.href = path;
  };

  return (
    <footer 
      className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-gray-400 pt-16 pb-8 px-4 sm:px-6 lg:px-8"
      role="contentinfo"
      aria-label="Footer navigation"
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          
          {/* ====== BRAND SECTION ====== */}
          <div 
            className="animate-fadeIn" 
            style={{ animationDelay: "0s" }}
            role="article"
            aria-label="Brand information"
          >
            <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-semibold mb-3">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Aazhi
              </span>
            </h3>
            <p className="text-[0.82rem] leading-relaxed text-gray-400/70 max-w-[240px]">
              Where love, comfort, and style unite to dress your little ones in 
              nothing but the finest organic clothing and baby essentials.
            </p>
            
            {/* ====== FIXED: Social Links with proper ARIA list structure ====== */}
            <div 
              className="flex gap-2.5 mt-5" 
              role="list" 
              aria-label="Social media links"
            >
              {/* Each child must have role="listitem" */}
              <div role="listitem">
                <a 
                  href="https://www.instagram.com/aazhi_clothing/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram - opens in new tab"
                  className="w-9 h-9 rounded-full border border-gray-600/30 flex items-center justify-center text-gray-400 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white transition-all duration-300 hover:scale-110 group"
                >
                  <InstagramIcon className="w-4 h-4 group-hover:text-white" />
                </a>
              </div>
              
              {/* Add more social links here if needed */}
              {/* 
              <div role="listitem">
                <a href="https://facebook.com/aazhiclothing" aria-label="Follow us on Facebook">
                  <FacebookIcon />
                </a>
              </div>
              */}
            </div>
          </div>
          
          {/* ====== SHOP SECTION ====== */}
          <nav 
            className="animate-fadeIn" 
            style={{ animationDelay: "0.1s" }}
            aria-label="Shop categories"
          >
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-purple-400 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5" role="list">
              {shopLinks.map((link, i) => (
                <li key={link.name} role="listitem">
                  <NavButton
                    onClick={() => handleNavigation(link.path, link.name)}
                    ariaLabel={`Browse ${link.name} collection`}
                    className="text-[0.82rem] text-gray-400 hover:text-purple-400 hover:translate-x-1"
                    delay={`${0.1 + i * 0.03}s`}
                  >
                    {link.name}
                  </NavButton>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* ====== COMPANY SECTION ====== */}
          <nav 
            className="animate-fadeIn" 
            style={{ animationDelay: "0.3s" }}
            aria-label="Company information"
          >
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-purple-400 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5" role="list">
              {companyLinks.map((link, i) => (
                <li key={link.name} role="listitem">
                  <NavButton
                    onClick={() => handleNavigation(link.path, link.name)}
                    ariaLabel={`Go to ${link.name} page`}
                    className="text-[0.82rem] text-gray-400 hover:text-purple-400 hover:translate-x-1"
                    delay={`${0.3 + i * 0.03}s`}
                  >
                    {link.name}
                  </NavButton>
                </li>
              ))}
            </ul>
            
            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-purple-400 mb-3">
                Secure Payments
              </h4>
              <div 
                className="flex flex-wrap gap-1.5" 
                role="list" 
                aria-label="Accepted payment methods"
              >
                {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking"].map((p, i) => (
                  <span 
                    key={p} 
                    role="listitem"
                    className="bg-white/5 text-purple-300/70 text-[0.58rem] font-bold px-2 py-1 rounded-full border border-purple-500/20 transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300"
                    style={{ animationDelay: `${0.4 + i * 0.05}s` }}
                    aria-label={`Payment method: ${p}`}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </nav>
        </div>
        
        {/* ====== FOOTER BOTTOM ====== */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.72rem] text-gray-500">
          <NavButton
            onClick={() => handleNavigation("/", "Home")}
            ariaLabel="Return to homepage"
            className="hover:text-purple-400"
          >
            © 2026 Aazhi. All rights reserved.
          </NavButton>
          
          <NavButton
            onClick={() => handleNavigation("/credits", "Credits")}
            ariaLabel="View credits page"
            className="hover:text-purple-400"
          >
            Credits
          </NavButton>
        </div>
      </div>

      {/* ====== ANIMATION STYLES ====== */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
        }
      `}</style>
    </footer>
  );
};

export default Footer;