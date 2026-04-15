import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/useCart';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import BackToTop from '@/components/BackToTop';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, clearCart, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  
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

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderPlaced]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 3000 ? 0 : 100;
  const total = subtotal + shipping;

  // Create pending order before payment
  const createPendingOrder = async () => {
  const sessionId = localStorage.getItem('tiinyberry_session_id');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headers: any = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('tiinyberry_token');
  
  // Add token if logged in, otherwise add session ID for guest
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  
  console.log('Creating order with headers:', headers);
  console.log('Shipping address:', formData);
  
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
      }
    })
  });
  
  const data = await response.json();
  console.log('Create pending order response:', data);
  
  if (data.success) {
    setPendingOrderId(data.orderId);
    return data.orderId;
  } else {
    throw new Error(data.message);
  }
};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        razorpayOrderId: response.razorpay_order_id
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
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Navbar />
        <div className="max-w-[1320px] mx-auto px-4 py-20 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-heading font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-4">Order #{orderNumber}</p>
            <div className="mb-6 p-3 bg-green-100 rounded-lg">
              <p className="text-green-700">
                ✅ Thank you {formData.fullName}!<br />
                Confirmation sent to <strong>{formData.email}</strong>
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-heading font-light mb-8">Checkout</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form className="bg-white border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Order confirmation will be sent here
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mobile Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-border rounded-l-lg bg-gray-50">+91</span>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="flex-1 px-4 py-2 border border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      For order updates and OTP login
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="House No, Street, Area"
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="bg-primary/5 border border-primary rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">₹</span>
                      </div>
                      <div>
                        <p className="font-semibold">Pay Online (Razorpay)</p>
                        <p className="text-xs text-muted-foreground">Secure UPI, Cards, Netbanking</p>
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
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By placing this order, you agree to our terms and conditions.<br />
                  A confirmation email will be sent to <strong>{formData.email || 'your email'}</strong>
                </p>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="bg-secondary/30 rounded-xl p-6 h-fit sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 py-2 border-b border-border">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=100&h=100&fit=crop';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">
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