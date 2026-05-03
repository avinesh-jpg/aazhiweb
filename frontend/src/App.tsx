import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartProvider";
//import ReactGA from "react-ga4";
import ReactGA from "react-ga4";
import Index from "@/pages/Index";
import CategoryPage from "@/pages/CategoryPage";  
import ProductDetails from "@/pages/ProductDetails";
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

// Component to track page views on route changes
//const PageTracker = () => {
  //const location = useLocation();

  //useEffect(() => {
    // Track page view whenever the URL changes
    /*ReactGA.send({
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view whenever the URL changes
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return null;
};
};*/

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/category/:type/:value" element={<CategoryPage />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
