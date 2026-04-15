import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronDown, LogOut, Phone, Package } from 'lucide-react';
import { useCart } from '@/context/useCart';
import MobileOTPLogin from './MobileOTPLogin';
import EmailOTPLogin from './EmailOTPLogin';


const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('tiinyberry_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = (userData: any, orders: any[]) => {
    setUser(userData);
    if (orders && orders.length > 0) {
      localStorage.setItem('tiinyberry_orders', JSON.stringify(orders));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tiinyberry_token');
    localStorage.removeItem('tiinyberry_user');
    localStorage.removeItem('tiinyberry_mobile');
    localStorage.removeItem('tiinyberry_orders');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const toggleMobileMenu = (label: string) => {
    setOpenMobileMenu(openMobileMenu === label ? null : label);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Get orders count
  const ordersCount = () => {
    const orders = localStorage.getItem('tiinyberry_orders');
    if (orders) {
      return JSON.parse(orders).length;
    }
    return 0;
  };

  const navItems = [
    {
      label: "New Born",
      path: "/category/age/0-3",
      links: [
        { name: "New Born Essential Kit", path: "/category/collection/newborn" },
        { name: "Organic Cotton Jablas & Nappies", path: "/category/collection/newborn" },
        { name: "Mittens & Booties", path: "/category/collection/accessories" },
        { name: "Muslin Hooded Towels", path: "/category/collection/bathing" },
        { name: "Cotton Wrap Bed", path: "/category/collection/bedding" },
        { name: "Receiving Towel", path: "/category/collection/accessories" },
        { name: "Muslin Reversible Blanket", path: "/category/collection/bedding" },
        { name: "Muslin Wipes", path: "/category/collection/bathing" },
        { name: "Thottil Starter Kit", path: "/category/collection/thottil" },
        { name: "Swaddles", path: "/category/collection/bedding" },
        { name: "Muslin Burp Cloth", path: "/category/collection/accessories" },
        { name: "Muslin Towels", path: "/category/collection/bathing" },
      ],
    },
    {
      label: "Bathing",
      path: "/category/collection/bathing",
      links: [
        { name: "Muslin Hooded Towels", path: "/category/collection/bathing" },
        { name: "Muslin Towels", path: "/category/collection/bathing" },
        { name: "Muslin Wipes", path: "/category/collection/bathing" },
      ],
    },
    {
      label: "Clothing",
      path: "/category/collection/clothing",
      links: [
        { name: "Frocks", path: "/category/collection/clothing" },
        { name: "Boys Shirts", path: "/category/collection/clothing" },
        { name: "Comfy Wears (1–5 Yrs)", path: "/category/collection/clothing" },
        { name: "Comfy Wears (3–6 Months)", path: "/category/collection/clothing" },
        { name: "Comfy Wears (6–12 Months)", path: "/category/collection/clothing" },
        { name: "Organic Cotton Jablas & Nappies", path: "/category/collection/newborn" },
      ],
    },
    {
      label: "Thottil",
      path: "/category/collection/thottil",
      links: [
        { name: "Thottil Starter Kit", path: "/category/collection/thottil" },
        { name: "Printed Thottil", path: "/category/collection/thottil" },
        { name: "Thottil & Net", path: "/category/collection/thottil" },
        { name: "Patched Thottil", path: "/category/collection/thottil" },
        { name: "Solid – Patched", path: "/category/collection/thottil" },
        { name: "Mosquito Net", path: "/category/collection/thottil" },
        { name: "Thottil Accessories", path: "/category/collection/thottil" },
      ],
    },
    {
      label: "Bedding",
      path: "/category/collection/bedding",
      links: [
        { name: "Cotton Wrap Bed", path: "/category/collection/bedding" },
        { name: "Hooded Muslin Towels", path: "/category/collection/bathing" },
        { name: "Muslin Reversible Blanket", path: "/category/collection/bedding" },
      ],
    },
    {
      label: "Nursery & Accessories",
      path: "/category/collection/accessories",
      links: [
        { name: "Cotton Wrap Bed", path: "/category/collection/bedding" },
        { name: "Receiving Towel", path: "/category/collection/accessories" },
        { name: "Muslin Wipes", path: "/category/collection/bathing" },
        { name: "Muslin Burp Cloth", path: "/category/collection/accessories" },
      ],
    },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 border-b border-border backdrop-blur-sm">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-foreground flex-shrink-0 cursor-pointer"
            >
              <span className="text-primary">Aazhi</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <div key={item.label} className="group relative">
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center gap-1 px-3 lg:px-4 h-[72px] text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {item.label}
                    <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-0 top-full w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white shadow-xl rounded-lg border border-border mt-1 overflow-hidden">
                      <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30">
                        {item.label}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {item.links.map((link) => (
                          <button
                            key={link.name}
                            onClick={() => handleNavigation(link.path)}
                            className="w-full text-left block px-4 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-accent/30 transition-all hover:pl-5 border-b border-border/40 last:border-0"
                          >
                            {link.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-0.5">
              {/* Search */}
              <button
                className="p-2.5 text-muted-foreground hover:text-primary hover:bg-accent/40 rounded-full transition-all"
                aria-label="Search"
              >
                <Search size={19} />
              </button>

              {/* User / Login Button */}
              {user ? (
                <div className="relative group">
                  <button className="p-2.5 text-muted-foreground hover:text-primary hover:bg-accent/40 rounded-full transition-all flex items-center gap-1">
                    <User size={19} />
                    <span className="text-sm hidden md:inline">{user.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 top-full w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white shadow-xl rounded-lg border border-border mt-1 overflow-hidden">
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <User size={14} />
                        My Profile
                      </button>
                      <button
                        onClick={() => handleNavigation('/orders')}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <Package size={14} />
                        My Orders ({ordersCount()})
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="p-2.5 text-muted-foreground hover:text-primary hover:bg-accent/40 rounded-full transition-all"
                  aria-label="Mobile Login"
                >
                  <User size={19} />
                </button>
              )}

              {/* Cart Button */}
             
<button
  onClick={() => handleNavigation('/cart')}
  className="p-2.5 text-muted-foreground hover:text-primary hover:bg-accent/40 rounded-full transition-all relative"
  aria-label="Cart"
>
  <ShoppingBag size={19} />
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[0.55rem] font-bold rounded-full flex items-center justify-center px-1">
      {cartCount > 99 ? '99+' : cartCount}
    </span>
  )}
</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-80 bg-background h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background">
              <span className="font-heading text-xl font-semibold text-foreground">
                Aazhi
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-accent rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 pb-20">
              {navItems.map((item) => (
                <div key={item.label} className="border-b border-border/60">
                  <button
                    onClick={() => {
                      handleNavigation(item.path);
                      toggleMobileMenu(item.label);
                    }}
                    className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-accent/30 transition-colors"
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${openMobileMenu === item.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openMobileMenu === item.label && (
                    <div className="bg-secondary/30 px-2 pb-3">
                      {item.links.map((link) => (
                        <button
                          key={link.name}
                          onClick={() => handleNavigation(link.path)}
                          className="w-full text-left block px-5 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-accent/40 rounded-md transition-all border-b border-border/30 last:border-0"
                        >
                          {link.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Mobile OTP Login Modal */}
      <EmailOTPLogin
  isOpen={isLoginOpen}
  onClose={() => setIsLoginOpen(false)}
  onLogin={handleLogin}
/>
    </>
  );
};

export default Navbar;