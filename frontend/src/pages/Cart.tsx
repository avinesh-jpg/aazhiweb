/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCart } from "@/context/useCart";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, Minus, Plus, ShoppingBag, Copy, Check, Lock, X } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import BackToTop from "@/components/BackToTop";
import { toast } from "sonner";

// Update CartItem interface
interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartCount, loading } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem('tiinyberry_token');
  const [stockInfo, setStockInfo] = useState<Map<string, number>>(new Map());
  const [checkingStock, setCheckingStock] = useState(false);
  
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 3000,
    standardShippingRate: 100
  });
  
  interface CouponTier {
    code: string;
    threshold: number;
    discount: number;
  }
  const [couponTiers, setCouponTiers] = useState<CouponTier[]>([]);
  const [showTiersModal, setShowTiersModal] = useState(false);

  // Fetch shipping settings
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/shipping/settings`);
        const data = await res.json();
        if (data.success && data.settings) {
          setShippingSettings({
            freeShippingThreshold: data.settings.freeShippingThreshold,
            standardShippingRate: data.settings.standardShippingRate
          });
        }
      } catch (err) {
        console.error("Error fetching shipping settings:", err);
      }
    };
    fetchShippingSettings();
  }, []);

  // Fetch coupon tiers
  useEffect(() => {
    const fetchCouponTiers = async () => {
      try {
        const res = await fetch(`${API_URL}/coupons/tiers`);
        const data = await res.json();
        if (data.success && data.tiers) {
          setCouponTiers(data.tiers);
        }
      } catch (err) {
        console.error("Error fetching coupon tiers:", err);
      }
    };
    fetchCouponTiers();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied coupon code: ${text}`);
  };

  // Fetch stock info for all cart items
  useEffect(() => {
    const fetchStockInfo = async () => {
      if (cartItems.length === 0) return;
      
      setCheckingStock(true);
      try {
        const stockMap = new Map<string, number>();
        
        for (const item of cartItems) {
          const response = await fetch(`${API_URL}/products/product/${item.productId}`);
          if (response.ok) {
            const product = await response.json();
            
            // Check if product has new size structure
            if (product.sizes && product.sizes.length > 0 && typeof product.sizes[0] === 'object') {
              // Find the specific size
              const sizeObj = product.sizes.find((s: any) => s.name === item.size);
              if (sizeObj) {
                stockMap.set(`${item.productId}-${item.size}`, sizeObj.stock);
              } else if (product.sizes[0].name === 'One Size') {
                stockMap.set(`${item.productId}-${item.size}`, product.sizes[0].stock);
              }
            } else if (product.stockQuantity !== undefined) {
              // Old format
              stockMap.set(`${item.productId}-${item.size || ''}`, product.stockQuantity);
            }
          }
        }
        
        setStockInfo(stockMap);
      } catch (error) {
        console.error('Error fetching stock info:', error);
      } finally {
        setCheckingStock(false);
      }
    };
    
    fetchStockInfo();
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingThreshold = shippingSettings.freeShippingThreshold;
  const shippingRate = shippingSettings.standardShippingRate;
  const shipping = subtotal >= shippingThreshold ? 0 : shippingRate;
  const total = subtotal + shipping;

  const getCouponLadderState = () => {
    if (couponTiers.length === 0) return null;
    
    const nextLocked = couponTiers.find(tier => subtotal < tier.threshold);
    const unlockedTiers = [...couponTiers].reverse().filter(tier => subtotal >= tier.threshold);
    const bestUnlocked = unlockedTiers[0] || null;
    const maxThreshold = couponTiers[couponTiers.length - 1].threshold;
    
    if (nextLocked) {
      const remaining = nextLocked.threshold - subtotal;
      const progress = (subtotal / nextLocked.threshold) * 100;
      return {
        isMaxed: false,
        nextTier: nextLocked,
        remaining,
        progress,
        bestUnlocked,
        maxThreshold
      };
    } else {
      const highestTier = couponTiers[couponTiers.length - 1];
      return {
        isMaxed: true,
        nextTier: null,
        remaining: 0,
        progress: 100,
        bestUnlocked: highestTier,
        maxThreshold
      };
    }
  };

  const couponState = getCouponLadderState();

  // Get available stock for an item
  const getAvailableStock = (item: CartItem): number => {
    const key = `${item.productId}-${item.size || ''}`;
    return stockInfo.get(key) || Infinity;
  };

  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Check stock availability
    const availableStock = getAvailableStock(item);
    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} items available in ${item.size || 'this size'}`);
      return;
    }
    
    // Pass size as third parameter
    await updateQuantity(item.productId, newQuantity, item.size);
  };

  const handleRemove = async (item: CartItem) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      // Pass size as second parameter
      await removeFromCart(item.productId, item.size);
    }
  };

  const handleCheckout = () => {
    console.log('Checkout button clicked');
    console.log('Cart items:', cartItems.length);
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Check if any items are out of stock
    const hasOutOfStock = cartItems.some(item => {
      const availableStock = getAvailableStock(item);
      return availableStock === 0;
    });
    
    if (hasOutOfStock) {
      toast.error('Some items in your cart are out of stock. Please remove them to continue.');
      return;
    }
    
    // Navigate to checkout page
    console.log('Navigating to checkout...');
    navigate('/checkout');
  };

  if (loading || checkingStock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
        <AnnouncementBar />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="inline-block rounded-full h-8 w-8 border-2 border-purple-300 border-t-purple-600 animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
      <AnnouncementBar />
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-purple-500 transition-all duration-300 mb-6 hover:-translate-x-1"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Continue Shopping</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-heading font-light mb-8 bg-gradient-to-r from-[#1e1b4b] to-[#5b21b6] bg-clip-text text-transparent">
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 animate-float">
                <ShoppingBag size={64} className="mx-auto text-purple-300" />
              </div>
              <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-purple-300/30 bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="border-b border-purple-200 pb-3 mb-4 hidden md:grid md:grid-cols-12 text-sm font-semibold text-purple-500 uppercase tracking-wide">
                  <div className="md:col-span-6">Product</div>
                  <div className="md:col-span-2 text-center">Price</div>
                  <div className="md:col-span-2 text-center">Quantity</div>
                  <div className="md:col-span-2 text-right">Total</div>
                </div>
                
                {cartItems.map((item, index) => {
                  const availableStock = getAvailableStock(item);
                  const isLowStock = availableStock <= 3 && availableStock > 0;
                  const isOutOfStock = availableStock === 0;
                  
                  return (
                    <div 
                      key={`${item.productId}-${item.size}-${index}`}
                      className={`border-b border-purple-100 py-6 transition-all duration-300 hover:bg-white/30 hover:rounded-xl hover:translate-x-1 ${
                        isOutOfStock ? 'opacity-60 bg-red-50/30' : ''
                      }`}
                    >
                      <div className="grid md:grid-cols-12 gap-4 items-center">
                        {/* Product Image & Name */}
                        <div className="md:col-span-6 flex gap-4">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-purple-200/50"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-[#1e1b4b] hover:text-purple-500 transition-colors duration-200">
                              {item.name}
                            </h3>
                            {item.size && item.size !== '' && (
                              <p className="text-sm mt-1 inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100/50 to-blue-100/50 text-purple-800 border border-purple-300">
                                Size: {item.size}
                              </p>
                            )}
                            {/* Low stock warning */}
                            {isLowStock && !isOutOfStock && (
                              <p className="text-xs text-orange-600 mt-2 animate-pulse">
                                ⚠️ Only {availableStock} left in stock!
                              </p>
                            )}
                            {isOutOfStock && (
                              <p className="text-xs text-red-600 mt-2">
                                ❌ Out of stock - Please remove this item
                              </p>
                            )}
                            <button
                              onClick={() => handleRemove(item)}
                              className="text-red-400 text-sm hover:text-red-600 mt-2 flex items-center gap-1 transition-all duration-300 hover:gap-2"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="md:col-span-2 text-center">
                          <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            Rs. {item.price.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              disabled={isOutOfStock}
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-300 ${
                                isOutOfStock
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'border-purple-200 bg-white/60 text-purple-500 hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-300 hover:text-white hover:border-transparent hover:scale-105 active:scale-95'
                              }`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-medium text-[#1e1b4b]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              disabled={isOutOfStock || item.quantity >= availableStock}
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-300 ${
                                isOutOfStock || item.quantity >= availableStock
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'border-purple-200 bg-white/60 text-purple-500 hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-300 hover:text-white hover:border-transparent hover:scale-105 active:scale-95'
                              }`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          {!isOutOfStock && availableStock < 10 && availableStock > 0 && (
                            <p className="text-xs text-center text-orange-500 mt-1">
                              Max: {availableStock}
                            </p>
                          )}
                        </div>
                        
                        {/* Total */}
                        <div className="md:col-span-2 text-right">
                          <span className="font-semibold text-purple-600">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 h-fit sticky top-24 transition-all duration-300 border border-purple-200/50 shadow-lg hover:bg-white/85 hover:border-purple-300/60 hover:shadow-purple-100/50">
                <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Order Summary
                </h2>
                
                {/* Progress Indicators */}
                <div className="space-y-4 mb-6">
                  {/* FREE DELIVERY CARD */}
                  <div className="bg-[#fcfaff]/80 border border-purple-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between text-xs font-semibold text-[#1e1b4b] uppercase tracking-wider mb-1">
                      <span>Free Delivery</span>
                      <span>Rs. {shippingThreshold.toLocaleString()}</span>
                    </div>
                    {subtotal >= shippingThreshold ? (
                      <p className="text-xs text-green-600 font-medium">🎉 You've unlocked FREE delivery!</p>
                    ) : (
                      <p className="text-xs text-gray-600">
                        Add <strong className="text-purple-600">Rs. {(shippingThreshold - subtotal).toLocaleString()}</strong> more for free delivery.
                      </p>
                    )}
                    <div className="mt-2 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* COUPON LADDER CARD */}
                  {couponState && (
                    <div className="bg-[#fcfaff]/80 border border-purple-100 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between text-xs font-semibold text-[#1e1b4b] uppercase tracking-wider mb-1">
                        <span>Launch Coupon Ladder</span>
                        <span>Rs. {couponState.maxThreshold.toLocaleString()}</span>
                      </div>
                      
                      {couponState.isMaxed ? (
                        <p className="text-xs text-green-600 font-medium">
                          🎉 Max discount unlocked! Copy code <strong className="cursor-pointer text-purple-700 underline font-mono bg-purple-50 px-1 py-0.5 rounded border border-purple-200" onClick={() => copyToClipboard(couponState.bestUnlocked!.code)}>{couponState.bestUnlocked!.code}</strong> to get Rs. {couponState.bestUnlocked!.discount} off.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Add <strong className="text-purple-600">Rs. {couponState.remaining.toLocaleString()}</strong> more to unlock <strong className="text-purple-600">Rs. {couponState.nextTier!.discount} off</strong> with code <strong className="cursor-pointer text-purple-700 hover:text-purple-900 underline font-mono bg-purple-50 px-1 py-0.5 rounded border border-purple-200" onClick={() => copyToClipboard(couponState.nextTier!.code)}>{couponState.nextTier!.code}</strong>.
                        </p>
                      )}
                      
                      <div className="mt-2 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, couponState.progress)}%` }}
                        />
                      </div>
                      
                      <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                        Only one coupon applies per order. Copy your best unlocked code and enter it at checkout.
                      </p>
                      <button 
                        onClick={() => setShowTiersModal(true)}
                        className="text-xs text-purple-600 hover:text-purple-800 hover:underline mt-2 font-medium block text-left"
                      >
                        View all launch coupon tiers
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Subtotal ({cartCount} items)</span>
                    <span className="font-medium text-[#1e1b4b]">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium text-[#1e1b4b]">
                      {shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {shipping > 0 && subtotal < shippingThreshold && (
                    <p className="text-xs text-green-600">
                      Add Rs. {(shippingThreshold - subtotal).toLocaleString()} more for free shipping
                    </p>
                  )}
                  <div className="border-t border-purple-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#1e1b4b]">Total</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        Rs. {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-300/40 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400"
                >
                  Proceed to Checkout
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="w-full mt-3 py-3 rounded-full font-semibold transition-all duration-300 bg-transparent border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 hover:-translate-y-0.5"
                >
                  Continue Shopping
                </button>
                
                {!token && (
                  <p className="text-xs text-gray-400 text-center mt-4">
                    Guest checkout available. Login to save your order history.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />

      {/* Tiers Modal */}
      {showTiersModal && (
        <div className="fixed inset-0 bg-[#000]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-purple-100 pb-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Launch Coupon Ladder Tiers
              </h3>
              <button 
                onClick={() => setShowTiersModal(false)}
                className="text-gray-400 hover:text-purple-600 transition-colors p-1 rounded-full hover:bg-purple-50"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-4">
              Unlock higher discount tiers by adding more items to your cart! Copy your best unlocked code to use at checkout.
            </p>
            
            <div className="space-y-3">
              {couponTiers.map((tier, idx) => {
                const isUnlocked = subtotal >= tier.threshold;
                const progressToTier = Math.min(100, (subtotal / tier.threshold) * 100);
                
                return (
                  <div 
                    key={idx}
                    className={`border rounded-xl p-4 transition-all duration-300 ${
                      isUnlocked 
                        ? 'border-green-200 bg-green-50/20' 
                        : 'border-purple-100 bg-purple-50/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isUnlocked ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Check size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-100/50 flex items-center justify-center text-purple-400">
                            <Lock size={14} />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#1e1b4b]">
                              Rs. {tier.discount} Off
                            </span>
                            <span className="text-[10px] text-gray-400">
                              (Min. spend Rs. {tier.threshold})
                            </span>
                          </div>
                          <span 
                            onClick={() => isUnlocked && copyToClipboard(tier.code)}
                            className={`inline-flex items-center gap-1 text-xs font-mono font-bold mt-1 px-2 py-0.5 rounded border transition-all ${
                              isUnlocked 
                                ? 'bg-green-100/80 border-green-200 text-green-700 cursor-pointer hover:bg-green-200/80' 
                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {tier.code}
                            {isUnlocked && <Copy size={10} />}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {isUnlocked ? (
                          <span className="text-xs font-semibold text-green-600">Unlocked</span>
                        ) : (
                          <span className="text-xs text-purple-500 font-medium">
                            Add Rs. {(tier.threshold - subtotal).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!isUnlocked && (
                      <div className="mt-3">
                        <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-300 rounded-full transition-all duration-300"
                            style={{ width: `${progressToTier}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={() => setShowTiersModal(false)}
              className="w-full mt-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-md transition-all duration-300"
            >
              Back to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;