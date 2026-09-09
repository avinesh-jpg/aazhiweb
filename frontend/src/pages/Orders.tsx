/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, Eye, LogIn, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import BackToTop from '@/components/BackToTop';

interface Order {
  _id: string;
  orderNumber: string;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const token = localStorage.getItem('tiinyberry_token');
  const user = JSON.parse(localStorage.getItem('tiinyberry_user') || 'null');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('tiinyberry_token');
        localStorage.removeItem('tiinyberry_user');
        localStorage.removeItem('tiinyberry_email');
        localStorage.removeItem('tiinyberry_orders');
        
        navigate('/');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('showLoginModal', { 
            detail: { message: 'Session expired. Please login again.' } 
          }));
        }, 100);
        return;
      }
      
      const data = await response.json();
      console.log('Orders response:', data);
      
      if (data.success) {
        setOrders(data.orders || []);
        localStorage.setItem('tiinyberry_orders', JSON.stringify(data.orders || []));
        localStorage.setItem('tiinyberry_orders_count', (data.orders?.length || 0).toString());
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Load orders error:', error);
      setError('Network error. Please try again.');
      
      const savedOrders = localStorage.getItem('tiinyberry_orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('showLoginModal', { 
          detail: { message: 'Please login to view your orders' } 
        }));
      }, 100);
      return;
    }
    
    const savedOrders = localStorage.getItem('tiinyberry_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    
    loadOrders();
  }, [token, navigate, loadOrders]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'confirmed': return <CheckCircle size={20} className="text-green-500" />;
      case 'processing': return <Package size={20} className="text-blue-500" />;
      case 'shipped': return <Truck size={20} className="text-purple-500" />;
      case 'delivered': return <CheckCircle size={20} className="text-green-600" />;
      case 'cancelled': return <Package size={20} className="text-red-500" />;
      default: return <Package size={20} className="text-purple-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date unavailable';
    }
  };

  const calculateSubtotal = (items: any[]) => {
    return items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  if (!token) {
    return null;
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
        <AnnouncementBar />
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="inline-block rounded-full h-12 w-12 border-2 border-purple-300 border-t-purple-600 animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading your orders...</p>
        </div>
        <Footer />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
      <AnnouncementBar />
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="max-w-[1320px] mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-heading font-light mb-2 bg-gradient-to-r from-[#1e1b4b] to-[#5b21b6] bg-clip-text text-transparent">
            My Orders
          </h1>
          {user && (
            <p className="text-gray-500 mb-8">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found for {user.email}
            </p>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 max-w-md mx-auto">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={loadOrders}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {!error && orders.length === 0 && (
            <div className="text-center py-12 bg-white/70 backdrop-blur-md rounded-2xl border border-purple-200/50 shadow-lg">
              <div className="mb-4 animate-float">
                <Package size={64} className="mx-auto text-purple-300" />
              </div>
              <p className="text-gray-500 text-lg mb-4">You haven't placed any orders yet</p>
              <p className="text-sm text-gray-400 mb-6">
                Start shopping to see your orders here
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-purple-300/30 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400"
              >
                Start Shopping
              </button>
            </div>
          )}
          
          {!error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div 
                  key={order._id} 
                  className="bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 animate-slideIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="font-semibold text-lg text-[#1e1b4b]">Order #{order.orderNumber || order._id.slice(-8)}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                      {order.shippingAddress?.fullName && (
                        <p className="text-sm text-gray-500 mt-1">
                          Customer: {order.shippingAddress.fullName}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status || 'Pending'}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-purple-100 pt-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-semibold text-lg mt-1 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                          Total: ₹{order.total?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Payment: {order.paymentMethod?.toUpperCase() || 'N/A'} • {order.paymentStatus || 'Pending'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                        className="px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 flex items-center gap-2 border-2 border-purple-300 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-400 hover:text-white hover:border-transparent"
                      >
                        <Eye size={14} />
                        {selectedOrder?._id === order._id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Order Details (Expandable) */}
                  {selectedOrder?._id === order._id && (
                    <div className="border-t border-purple-100 mt-4 pt-4 animate-fadeIn">
                      <h3 className="font-semibold mb-3 text-[#1e1b4b]">Order Items</h3>
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 py-2 border-b border-purple-100 last:border-0">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=60&h=60&fit=crop'}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=60&h=60&fit=crop';
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-[#1e1b4b]">{item.name}</p>
                                {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                                {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity} × ₹{item.price?.toLocaleString() || '0'}
                                </p>
                                <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                                  ₹{(item.price * item.quantity)?.toLocaleString() || '0'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No items found for this order</p>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-purple-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="text-[#1e1b4b]">₹{(order.subtotal ?? calculateSubtotal(order.items)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Shipping</span>
                          <span className={order.shipping && order.shipping > 0 ? "text-[#1e1b4b]" : "text-green-600 font-medium"}>
                            {order.shipping && order.shipping > 0 ? `₹${order.shipping.toLocaleString()}` : 'FREE'}
                          </span>
                        </div>
                        {order.discount ? (
                          <div className="flex justify-between text-sm mt-1 text-green-600">
                            <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                            <span>-₹{order.discount.toLocaleString()}</span>
                          </div>
                        ) : null}
                        {order.paymentMethod === 'cod' && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="text-[#1e1b4b]">Cash on Delivery</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-purple-100">
                          <span className="text-[#1e1b4b]">Total</span>
                          <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            ₹{order.total?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                      
                      {order.shippingAddress && (
                        <div className="mt-4 pt-4 border-t border-purple-100">
                          <h3 className="font-semibold mb-2 text-[#1e1b4b]">Shipping Address</h3>
                          <p className="text-sm text-[#1e1b4b]">{order.shippingAddress.fullName}</p>
                          <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
                          <p className="text-sm text-gray-500">
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                          </p>
                          <p className="text-sm text-gray-500">Phone: {order.shippingAddress.phone}</p>
                          {order.shippingAddress.email && (
                            <p className="text-sm text-gray-500">Email: {order.shippingAddress.email}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Orders;