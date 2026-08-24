import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { CartProvider } from "@/context/CartProvider";
import { HelmetProvider } from 'react-helmet-async';
import ReactGA from "react-ga4";

// 🚀 LAZY LOAD - Pages load only when needed
const Index = lazy(() => import("@/pages/Index"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const ProductDetailsBySlug = lazy(() => import("@/pages/ProductDetailsBySlug"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
const ComboDetails = lazy(() => import("@/pages/ComboDetails"));
const CombosPage = lazy(() => import("@/pages/Combospage"));
const About = lazy(() => import("./pages/About"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const Contact = lazy(() => import("./pages/ContactUs"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

// 🌀 Loading spinner while page loads
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
      <div className="inline-block rounded-full h-12 w-12 border-4 border-purple-300 border-t-purple-600 animate-spin"></div>
    </div>
  );
}

// 📊 Route pageview tracker for Google Analytics
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
}

// 🔝 Reset scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <AnalyticsTracker />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Static Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/combo/:id" element={<ComboDetails />} />
              <Route path="/shop/combos" element={<CombosPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/ShippingPolicy" element={<ShippingPolicy />} />
              <Route path="/help/return-policy" element={<ReturnPolicy />} /> 
              <Route path="/contact" element={<Contact />} />
              
              {/* Legacy ID-based product route */}
              <Route path="/product/:id" element={<ProductDetails />} />
              
              {/* Legacy category route */}
              <Route path="/category/:type/:value" element={<CategoryPage />} />
              
              {/* Dynamic Clean Nested Storefront Routes */}
              <Route path="/:category" element={<CategoryPage />} />
              <Route path="/:category/:subcategory" element={<CategoryPage />} />
              <Route path="/:category/:subcategory/:slug" element={<ProductDetailsBySlug />} />
              
              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;