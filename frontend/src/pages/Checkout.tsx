/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/useCart';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import BackToTop from '@/components/BackToTop';
import { Truck, Clock, Zap, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, clearCart, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingCost, setShippingCost] = useState(0);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [remainingForFree, setRemainingForFree] = useState(0);
  
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

  // Load user's default address from profile
  useEffect(() => {
    const loadAddress = async () => {
      try {
        if (!token) return;

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

  // Calculate shipping cost
  useEffect(() => {
    const calculateShipping = async () => {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      try {
        const response = await fetch(`${API_URL}/shipping/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtotal, shippingMethod })
        });
        const data = await response.json();
        
        if (data.success) {
          setShippingCost(data.shippingCost);
          setIsFreeShipping(data.isFree);
          setFreeShippingThreshold(data.freeShippingThreshold);
          setRemainingForFree(data.remainingForFree);
        }
      } catch (error) {
        console.error('Shipping calculation error:', error);
      }
    };
    
    calculateShipping();
  }, [cartItems, shippingMethod]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingCost;

  // Create pending order before payment
  const createPendingOrder = async () => {
    const sessionId = localStorage.getItem('tiinyberry_session_id');
    const headers: any = { 'Content-Type': 'application/json' };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (sessionId) {
      headers['x-session-id'] = sessionId;
    }
    
    // Validate form data
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
        shippingCost
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setPendingOrderId(data.orderId);
      return data.orderId;
    } else {
      throw new Error(data.message);
    }
  };

  const handlePaymentSuccess = async (response: any, orderId: string) => {
    console.log('Payment success:', response);
    console.log('Order ID:', orderId);
    
    // Confirm the order after successful payment
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
      setOrderNumber(confirmData.order.orderNumber);
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
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form className="bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-purple-100/50">
                <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Shipping Information
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">Full Name *</label>
                  <input
                    type="text"
                    required
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Order confirmation will be sent here
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">Mobile Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-purple-200 rounded-l-xl bg-purple-50 text-purple-600">+91</span>
                      <input
                        type="tel"
                        required
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
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1e1b4b]">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
                
                {/* Shipping Method */}
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
            
            {/* Order Summary */}
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
              
              <div className="space-y-2 pt-3 border-t border-purple-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({cartCount} items)</span>
                  <span className="text-[#1e1b4b]">₹{subtotal.toLocaleString()}</span>
                </div>
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