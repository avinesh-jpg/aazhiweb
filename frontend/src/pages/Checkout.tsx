/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/useCart';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import BackToTop from '@/components/BackToTop';
import { Truck, Shield, Sparkles, Loader2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, clearCart, fetchCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingCost, setShippingCost] = useState(0);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [remainingForFree, setRemainingForFree] = useState(0);
  
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [isLookingUp, setIsLookingUp] = useState(false);
  const [autoFilledInfo, setAutoFilledInfo] = useState<string | null>(null);
  const lookedUpEmailRef = useRef<string>('');

  const token = localStorage.getItem('tiinyberry_token');
  const user = JSON.parse(localStorage.getItem('tiinyberry_user') || 'null');
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.mobileNumber || user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - (appliedCoupon?.discount || 0) + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal })
      });
      const data = await response.json();
      
      if (data.success) {
        setAppliedCoupon({
          code: data.code,
          discount: data.discount
        });
        setCouponInput(data.code);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
      setCouponError('Failed to validate coupon code. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  // Look up customer address when typing email or leaving email field
  const lookupCustomerAddress = async (emailToLookup: string) => {
    const cleanEmail = emailToLookup?.trim().toLowerCase();
    if (!cleanEmail || cleanEmail === lookedUpEmailRef.current) return;
    
    // Check if looks like a valid email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) return;

    lookedUpEmailRef.current = cleanEmail;
    setIsLookingUp(true);

    try {
      const response = await fetch(`${API_URL}/orders/lookup-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await response.json();

      if (data.success && data.address) {
        const addr = data.address;
        let matchedState = addr.state || '';
        if (matchedState) {
          const found = INDIAN_STATES.find((s) => s.toLowerCase() === matchedState.trim().toLowerCase());
          if (found) matchedState = found;
        }

        setFormData((prev) => ({
          ...prev,
          fullName: addr.fullName || prev.fullName,
          phone: addr.phone || prev.phone,
          address: addr.address || prev.address,
          city: addr.city || prev.city,
          state: matchedState || prev.state,
          pincode: addr.pincode || prev.pincode,
        }));
        setAutoFilledInfo('✨ Welcome back! Your address details were automatically filled.');
      }
    } catch (err) {
      console.error('Customer address lookup failed:', err);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Debounce email lookup when customer types email
  useEffect(() => {
    if (!formData.email || !formData.email.includes('@') || !formData.email.includes('.')) {
      return;
    }

    const timer = setTimeout(() => {
      lookupCustomerAddress(formData.email);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Load user's default address from profile or device storage
  useEffect(() => {
    const loadAddress = async () => {
      try {
        if (token) {
          const res = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const data = await res.json();

          if (data.success && data.user.addresses?.length > 0) {
            const defaultAddress =
              data.user.addresses.find((a: any) => a.isDefault) ||
              data.user.addresses[0];

            setFormData((prev) => ({
              ...prev,
              fullName: defaultAddress.fullName || prev.fullName,
              email: defaultAddress.email || prev.email,
              phone: defaultAddress.phone || prev.phone,
              address: defaultAddress.address || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              pincode: defaultAddress.pincode || ''
            }));
            if (defaultAddress.email) {
              lookedUpEmailRef.current = defaultAddress.email.toLowerCase().trim();
            }
            return;
          }
        }

        // Fallback: Check local device cache for returning guest
        const saved = localStorage.getItem('aazhi_saved_shipping');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setFormData((prev) => ({
              fullName: prev.fullName || parsed.fullName || '',
              email: prev.email || parsed.email || '',
              phone: prev.phone || parsed.phone || '',
              address: prev.address || parsed.address || '',
              city: prev.city || parsed.city || '',
              state: prev.state || parsed.state || '',
              pincode: prev.pincode || parsed.pincode || ''
            }));
            if (parsed.email) {
              lookedUpEmailRef.current = parsed.email.toLowerCase().trim();
            }
          }
        }
      } catch (err) {
        console.error('Error loading address:', err);
      }
    };

    loadAddress();
  }, [token]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderPlaced]);

  // Calculate shipping cost & track shipping info in GA4
  useEffect(() => {
    const calculateShipping = async () => {
      const calculatedSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      try {
        const response = await fetch(`${API_URL}/shipping/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtotal: calculatedSubtotal, shippingMethod })
        });
        const data = await response.json();
        
        if (data.success) {
          setShippingCost(data.shippingCost);
          setIsFreeShipping(data.isFree);
          setFreeShippingThreshold(data.freeShippingThreshold);
          setRemainingForFree(data.remainingForFree);

          if (cartItems.length > 0) {
            trackEvent('add_shipping_info', {
              currency: 'INR',
              value: calculatedSubtotal + data.shippingCost - (appliedCoupon?.discount || 0),
              shipping_tier: shippingMethod,
              coupon: appliedCoupon?.code || undefined,
              items: cartItems.map(item => ({
                item_id: String(item.productId),
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
                item_variant: item.size || undefined
              }))
            });
          }
        }
      } catch (error) {
        console.error('Shipping calculation error:', error);
      }
    };
    
    if (cartItems.length > 0) {
      calculateShipping();
    }
  }, [cartItems, shippingMethod, appliedCoupon]);

  // Create pending order before payment & track payment info
  const createPendingOrder = async () => {
    const sessionId = localStorage.getItem('tiinyberry_session_id');
    const headers: any = { 'Content-Type': 'application/json' };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (sessionId) {
      headers['x-session-id'] = sessionId;
    }
    
    if (!formData.fullName) {
      throw new Error('Please enter your full name');
    }
    if (!formData.email) {
      throw new Error('Please enter your email address');
    }
    if (!formData.phone || formData.phone.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number');
    }
    if (!formData.address) {
      throw new Error('Please enter your address');
    }

    // GA4: Trigger add_payment_info
    trackEvent('add_payment_info', {
      currency: 'INR',
      value: total,
      payment_type: 'Razorpay',
      coupon: appliedCoupon?.code || undefined,
      items: cartItems.map(item => ({
        item_id: String(item.productId),
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_variant: item.size || undefined
      }))
    });
    
    const response = await fetch(`${API_URL}/orders/create-pending`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          phone: formData.phone,
          email: formData.email
        },
        shippingMethod,
        shippingCost,
        couponCode: appliedCoupon?.code || null
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.orderId;
    } else {
      throw new Error(data.message);
    }
  };

  const handlePaymentSuccess = async (response: any, orderId: string) => {
    const confirmResponse = await fetch(`${API_URL}/orders/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        shippingMethod,
        shippingCost
      })
    });
    
    const confirmData = await confirmResponse.json();
    
    if (confirmData.success) {
      const confirmedOrderNum = confirmData.order?.orderNumber || orderId;

      // GA4: Track final purchase event
      trackEvent('purchase', {
        transaction_id: String(confirmedOrderNum),
        value: total,
        currency: 'INR',
        tax: 0,
        shipping: shippingCost,
        coupon: appliedCoupon?.code || undefined,
        payment_type: 'Razorpay',
        items: cartItems.map(item => ({
          item_id: String(item.productId),
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_variant: item.size || undefined
        }))
      });


      // 👇 ADD THIS FOR META PIXEL
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
      value: total,
      currency: 'INR',
      content_type: 'product',
      contents: cartItems.map((item: any) => ({
        id: String(item.productId),
        quantity: item.quantity,
        item_price: item.price,
      })),
    });
  }

      // Save shipping address to local device storage for future fast auto-fill
      try {
        localStorage.setItem('aazhi_saved_shipping', JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }));
      } catch (storageErr) {
        console.error('Failed to cache shipping info in localStorage:', storageErr);
      }

      setOrderNumber(confirmedOrderNum);
      setOrderPlaced(true);
      await clearCart();
      await fetchCart();
    } else {
      alert('Order confirmation failed: ' + confirmData.message);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
        <AnnouncementBar />
        <Navbar />
        <div className="max-w-[1320px] mx-auto px-4 py-20 text-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-2xl font-heading font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-500 mb-4">Order #{orderNumber}</p>
            <div className="mb-6 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
              <p className="text-green-700">
                ✅ Thank you {formData.fullName}!<br />
                Confirmation sent to <strong>{formData.email}</strong>
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="w-full px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-purple-300/30 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400"
            >
              View My Orders
            </button>
          </div>
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
          <h1 className="text-3xl md:text-4xl font-heading font-light mb-8 bg-gradient-to-r from-[#1e1b4b] to-[#5b21b6] bg-clip-text text-transparent">
            Checkout
          </h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form className="bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-purple-100/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    Shipping Information
                  </h2>
                  {isLookingUp && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                      Checking saved details...
                    </span>
                  )}
                </div>

                {autoFilledInfo && (
                  <div className="mb-5 p-3.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs sm:text-sm text-purple-900 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{autoFilledInfo}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoFilledInfo(null)}
                      className="text-gray-400 hover:text-gray-600 font-bold ml-2 text-sm px-1.5 py-0.5 rounded cursor-pointer"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">Full Name *</label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">Email Address *</label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => lookupCustomerAddress(formData.email)}
                      className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Type your email to automatically load your saved details
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">Mobile Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-purple-200 rounded-l-xl bg-purple-50 text-purple-600">+91</span>
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="flex-1 px-4 py-2 border border-purple-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      For order updates
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">Address *</label>
                  <input
                    type="text"
                    required
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                    placeholder="House No, Street, Area"
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">City *</label>
                    <input
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">State *</label>
                    <select
                      required
                      autoComplete="address-level1"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80 text-[#1e1b4b]"
                    >
                      <option value="" disabled>Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                      {formData.state && !INDIAN_STATES.includes(formData.state) && (
                        <option value={formData.state}>{formData.state}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">Pincode *</label>
                    <input
                      type="text"
                      required
                      autoComplete="postal-code"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Shipping Method
                </h2>
                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-3 p-3 border border-purple-200 rounded-xl cursor-pointer transition-all duration-300 hover:bg-purple-50/50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="text-purple-500 focus:ring-purple-400"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-purple-500" />
                        <span className="font-medium text-[#1e1b4b]">Standard Shipping</span>
                      </div>
                      <p className="text-xs text-gray-500">Delivery in 2-4 business days</p>
                    </div>
                    <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                      {isFreeShipping ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </label>
                </div>
                
                {!isFreeShipping && remainingForFree > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <p className="text-sm text-purple-700 flex items-center gap-2">
                      <Shield size={16} />
                      Add ₹{remainingForFree.toLocaleString()} more for FREE shipping!
                    </p>
                    <div className="mt-2 h-2 bg-purple-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold">₹</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1e1b4b]">Pay Online (Razorpay)</p>
                        <p className="text-xs text-gray-500">Secure UPI, Cards, Netbanking</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <RazorpayCheckout
                  amount={total}
                  onCreateOrder={createPendingOrder}
                  onSuccess={handlePaymentSuccess}
                  onFailure={(error) => {
                    console.error('Payment failed:', error);
                    alert('Payment failed. Please try again.');
                  }}
                />
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to our terms and conditions.<br />
                  A confirmation email will be sent to <strong className="text-purple-600">{formData.email || 'your email'}</strong>
                </p>
              </form>
            </div>
            
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 h-fit sticky top-24 transition-all duration-300 border border-purple-200/50 shadow-lg hover:shadow-purple-100/50">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto custom-scroll">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 py-2 border-b border-purple-100">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=100&h=100&fit=crop';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1e1b4b]">{item.name}</p>
                      {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="py-4 border-t border-b border-purple-100 my-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon Code"
                    disabled={couponLoading || !!appliedCoupon}
                    className="flex-1 px-3 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm uppercase bg-white/80"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    ✓ Coupon <strong>{appliedCoupon.code}</strong> applied successfully! You saved ₹{appliedCoupon.discount.toLocaleString()}.
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    ✗ {couponError}
                  </p>
                )}
              </div>
              
              <div className="space-y-2 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({cartCount} items)</span>
                  <span className="text-[#1e1b4b]">₹{subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-[#1e1b4b]">{isFreeShipping ? 'FREE' : `₹${shippingCost.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-purple-200">
                  <span className="text-[#1e1b4b]">Total</span>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent font-bold">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <p className="text-xs text-purple-600">
                  <strong>Note:</strong> Your name and email will be used for order confirmation and tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Checkout;