const shopLinks = [
  { name: "New Born", path: "/category/collection/newborn" },
  { name: "Girls", path: "/category/collection/girls" },
  { name: "Boys", path: "/category/collection/boys" },
  { name: "Unisex", path: "/category/collection/unisex" },
  { name: "Accessories", path: "/category/collection/accessories" }
];



const companyLinks = [
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
  { name: "Shipping Policy", path: "/ShippingPolicy" },
  { name: "Return Policy", path: "/help/return-policy" },
];

const Footer = () => {
  const handleNavigation = (path) => {
    // If using React Router
    // navigate(path);
    
    // If using Next.js Router
    // router.push(path);
    
    // If using simple window location
    window.location.href = path;
  };

  return (
    <footer className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-gray-400 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="animate-fadeIn" style={{ animationDelay: "0s" }}>
            <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-semibold mb-3">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Aazhi</span>
            </h3>
            <p className="text-[0.82rem] leading-relaxed text-gray-400/70 max-w-[240px]">
              Where love, comfort, and style unite to dress your little ones in nothing but the finest organic clothing and baby essentials.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[
                { name: "Ig", path: "https://instagram.com" },
                { name: "Fb", path: "https://facebook.com" },
                { name: "WA", path: "https://wa.me" },
                { name: "YT", path: "https://youtube.com" }
              ].map((social, i) => (
                <a 
                  key={social.name} 
                  href={social.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gray-600/30 flex items-center justify-center text-[0.65rem] font-bold text-gray-400 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white transition-all duration-300 hover:scale-110"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
          
          {/* Shop */}
          <div className="animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-purple-400 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link, i) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-[0.82rem] text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block bg-transparent border-0 cursor-pointer"
                    style={{ animationDelay: `${0.1 + i * 0.03}s` }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          
          {/* Company */}
          <div className="animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-purple-400 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link, i) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-[0.82rem] text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block bg-transparent border-0 cursor-pointer"
                    style={{ animationDelay: `${0.3 + i * 0.03}s` }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-purple-400 mb-3">Secure Payments</h4>
              <div className="flex flex-wrap gap-1.5">
                {["UPI", "Visa", "MC", "RuPay", "Net Banking"].map((p, i) => (
                  <span 
                    key={p} 
                    className="bg-white/5 text-purple-300/70 text-[0.58rem] font-bold px-2 py-1 rounded-full border border-purple-500/20 transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300"
                    style={{ animationDelay: `${0.4 + i * 0.05}s` }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.72rem] text-gray-500">
          <button 
            onClick={() => handleNavigation("/")}
            className="hover:text-purple-400 transition-colors duration-300 bg-transparent border-0 cursor-pointer"
          >
            © 2024 Aazhi. All rights reserved. Made with ♥ for little ones.
          </button>
          <button 
            onClick={() => handleNavigation("/credits")}
            className="hover:text-purple-400 transition-colors duration-300 bg-transparent border-0 cursor-pointer"
          >
            Designed & Developed with Love
          </button>
        </div>
      </div>

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