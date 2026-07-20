import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartProvider";
import Index from "@/pages/Index";
import CategoryPage from "@/pages/CategoryPage";  
import ProductDetails from "@/pages/ProductDetails";        // ← ORIGINAL (ID-based)
import ProductDetailsBySlug from "@/pages/ProductDetailsBySlug"; // ← NEW (Slug-based)
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import Profile from "@/pages/Profile";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import SearchResults from "@/pages/SearchResults";
import ComboDetails from "@/pages/ComboDetails";
import CombosPage from "@/pages/Combospage";
import About from "./pages/About";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import Contact from "./pages/ContactUs";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/category/:type/:value" element={<CategoryPage />} />
            
            {/* ✅ NEW: Blog Routes */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* ✅ NEW: Direct category/subcategory/slug routes (without /product) */}
            <Route path="/:category/:subcategory/:slug" element={<ProductDetailsBySlug />} />
            
            {/* ✅ Fallback: Just slug (if no category/subcategory) */}
            <Route path="/:slug" element={<ProductDetailsBySlug />} />
            
            {/* ✅ EXISTING: ID-based route (keep for backward compatibility) */}
            <Route path="/product/:id" element={<ProductDetails />} />
            
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;