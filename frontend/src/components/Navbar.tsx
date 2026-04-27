/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronDown, LogOut, Package } from 'lucide-react';
import { useCart } from '@/context/useCart';
import EmailOTPLogin from './EmailOTPLogin';
import SearchModal from './SearchModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('tiinyberry_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await fetch(`${API_URL}/subcategories`);
      const data = await response.json();
      if (data.success) {
        setSubcategories(data.subcategories);
      }
    } catch (error) {
      console.error('Fetch subcategories error:', error);
    }
  };

  const handleLogin = (userData: any, orders: any[]) => {
    setUser(userData);
    if (orders && orders.length > 0) {
      localStorage.setItem('tiinyberry_orders', JSON.stringify(orders));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tiinyberry_token');
    localStorage.removeItem('tiinyberry_user');
    localStorage.removeItem('tiinyberry_email');
    localStorage.removeItem('tiinyberry_orders');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const getSubcategoriesByCategory = (category: string) => {
    return subcategories.filter(sub => sub.category === category);
  };

  const ordersCount = () => {
    const orders = localStorage.getItem('tiinyberry_orders');
    if (orders) return JSON.parse(orders).length;
    return 0;
  };

  const navItems = [
    { label: "New Born",             category: "newborn",    path: "/category/collection/newborn" },
    { label: "Bathing",              category: "bathing",    path: "/category/collection/bathing" },
    { label: "Clothing",             category: "clothing",   path: "/category/collection/clothing" },
    { label: "Thottil",              category: "thottil",    path: "/category/collection/thottil" },
    { label: "Bedding",              category: "bedding",    path: "/category/collection/bedding" },
    { label: "Nursery & Accessories",category: "accessories",path: "/category/collection/accessories" },
    /*{ label: "Combo",                category: "",           path: "/shop/combos" },*/
  ];

  return (
    <>
      <style>{`
        .navbar-root {
          background: linear-gradient(135deg, #e8f0fe 0%, #f3e8ff 50%, #e0f2fe 100%);
          border-bottom: 1px solid rgba(147, 117, 205, 0.2);
          backdrop-filter: blur(12px);
        }

        .nav-logo {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-link {
          color: #5b4f82;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 2px;
          transition: width 0.25s ease;
        }
        .nav-link:hover::after { width: 70%; }
        .nav-link:hover { color: #7c3aed; }

        .icon-btn {
          color: #7c6fa0;
          background: transparent;
          border-radius: 9999px;
          padding: 0.5rem;
          transition: background 0.2s, color 0.2s;
        }
        .icon-btn:hover {
          background: rgba(139, 92, 246, 0.12);
          color: #6d28d9;
        }

        .cart-badge {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
        }

        .dropdown-panel {
          background: linear-gradient(160deg, #f0ebff 0%, #e8f3ff 100%);
          border: 1px solid rgba(139, 92, 246, 0.18);
          box-shadow: 0 12px 40px rgba(107, 70, 193, 0.15);
        }
        .dropdown-header {
          background: rgba(167, 139, 250, 0.15);
          border-bottom: 1px solid rgba(139, 92, 246, 0.15);
          color: #7c3aed;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0.6rem 1rem;
        }
        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
          color: #5b4f82;
          border-bottom: 1px solid rgba(139, 92, 246, 0.08);
          transition: background 0.15s, color 0.15s, padding-left 0.15s;
        }
        .dropdown-item:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #6d28d9;
          padding-left: 1.25rem;
        }
        .dropdown-item:last-child { border-bottom: none; }

        /* User dropdown */
        .user-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          text-align: left;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          color: #5b4f82;
          transition: background 0.15s, color 0.15s;
        }
        .user-dropdown-item:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #6d28d9;
        }
        .user-dropdown-item.danger { color: #dc2626; }
        .user-dropdown-item.danger:hover { background: #fef2f2; }

        /* Mobile sidebar */
        .mobile-sidebar {
          background: linear-gradient(180deg, #f0ebff 0%, #e8f3ff 100%);
        }
        .mobile-sidebar-header {
          background: linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }
        .mobile-nav-item {
          border-bottom: 1px solid rgba(139, 92, 246, 0.12);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4c3d7a;
          transition: background 0.15s;
        }
        .mobile-nav-item:hover { background: rgba(139, 92, 246, 0.08); }
        .mobile-sub-panel {
          background: rgba(167, 139, 250, 0.08);
          padding: 0.25rem 0.5rem 0.75rem;
        }
        .mobile-sub-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.625rem 1.25rem;
          font-size: 0.85rem;
          color: #6b5ea8;
          border-bottom: 1px solid rgba(139, 92, 246, 0.08);
          border-radius: 0.375rem;
          transition: background 0.15s, color 0.15s;
        }
        .mobile-sub-item:hover { background: rgba(139, 92, 246, 0.1); color: #5b21b6; }
        .mobile-sub-item.primary { color: #7c3aed; font-weight: 600; }
        .mobile-sub-item:last-child { border-bottom: none; }

        .overlay-bg {
          background: rgba(76, 61, 122, 0.45);
          backdrop-filter: blur(4px);
        }
      `}</style>

      <nav className="navbar-root sticky top-0 z-50">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">

            {/* Mobile menu button */}
            <button
              className="md:hidden icon-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              className="nav-logo font-heading text-2xl md:text-3xl font-semibold tracking-tight flex-shrink-0 cursor-pointer"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Aazhi
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const subItems = getSubcategoriesByCategory(item.category);
                return (
                  <div key={item.label} className="group relative">
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="nav-link flex items-center gap-1 px-3 lg:px-4 h-[72px] whitespace-nowrap"
                    >
                      {item.label}
                      {subItems.length > 0 && (
                        <ChevronDown size={12} className="transition-transform group-hover:rotate-180 text-violet-400" />
                      )}
                    </button>
                    {subItems.length > 0 && (
                      <div className="absolute left-0 top-full w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="dropdown-panel rounded-xl mt-1 overflow-hidden">
                          <div className="dropdown-header">{item.label}</div>
                          <div className="max-h-96 overflow-y-auto">
                            {subItems.map((sub) => (
                              <button
                                key={sub._id}
                                onClick={() => handleNavigation(`/category/subcategory/${sub.name}`)}
                                className="dropdown-item"
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-0.5">
              {/* Search */}
              <button onClick={() => setIsSearchOpen(true)} className="icon-btn" aria-label="Search">
                <Search size={19} />
              </button>

              {/* User */}
              {user ? (
                <div className="relative group">
                  <button className="icon-btn flex items-center gap-1">
                    <User size={19} />
                    <span className="text-sm hidden md:inline text-violet-700 font-medium">
                      {user.name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown size={14} className="text-violet-400" />
                  </button>
                  <div className="absolute right-0 top-full w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="dropdown-panel rounded-xl mt-1 overflow-hidden">
                      <button onClick={() => handleNavigation('/profile')} className="user-dropdown-item">
                        <User size={14} /> My Profile
                      </button>
                      <button onClick={() => handleNavigation('/orders')} className="user-dropdown-item">
                        <Package size={14} /> My Orders ({ordersCount()})
                      </button>
                      <button onClick={handleLogout} className="user-dropdown-item danger">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsLoginOpen(true)} className="icon-btn" aria-label="Login">
                  <User size={19} />
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => handleNavigation('/cart')}
                className="icon-btn relative"
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="cart-badge absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[0.55rem] font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="overlay-bg fixed inset-0 transition-opacity" onClick={() => setMobileOpen(false)} />
          <aside className="mobile-sidebar relative z-10 w-80 h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-in-right">
            <div className="mobile-sidebar-header flex items-center justify-between p-5 sticky top-0">
              <span
                className="nav-logo text-xl font-semibold"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Aazhi
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="icon-btn"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 pb-20">
              {navItems.map((item) => {
                const subItems = getSubcategoriesByCategory(item.category);
                const isOpen = openMobileMenu === item.label;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => {
                        if (subItems.length > 0) {
                          setOpenMobileMenu(isOpen ? null : item.label);
                        } else {
                          handleNavigation(item.path);
                        }
                      }}
                      className="mobile-nav-item"
                    >
                      {item.label}
                      {subItems.length > 0 && (
                        <ChevronDown
                          size={14}
                          className={`text-violet-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>
                    {isOpen && subItems.length > 0 && (
                      <div className="mobile-sub-panel">
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className="mobile-sub-item primary"
                        >
                          All {item.label}
                        </button>
                        {subItems.map((sub) => (
                          <button
                            key={sub._id}
                            onClick={() => handleNavigation(`/category/subcategory/${sub.name}`)}
                            className="mobile-sub-item"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Modals */}
      <EmailOTPLogin
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;
