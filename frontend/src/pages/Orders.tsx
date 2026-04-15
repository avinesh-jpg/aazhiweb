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

  // Define loadOrders with useCallback to prevent unnecessary re-renders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
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
      
      // Try to load from localStorage as fallback
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      // Redirect to home page with login modal trigger
      navigate('/');
      // Trigger login modal after navigation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('showLoginModal', { 
          detail: { message: 'Please login to view your orders' } 
        }));
      }, 100);
      return;
    }
    
    // Try to load from localStorage first for instant display
    const savedOrders = localStorage.getItem('tiinyberry_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    
    loadOrders();
  }, [token, navigate, loadOrders]); // Added loadOrders to dependencies

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'confirmed': return <CheckCircle size={20} className="text-green-500" />;
      case 'processing': return <Package size={20} className="text-blue-500" />;
      case 'shipped': return <Truck size={20} className="text-purple-500" />;
      case 'delivered': return <CheckCircle size={20} className="text-green-600" />;
      case 'cancelled': return <Package size={20} className="text-red-500" />;
      default: return <Package size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    return null; // Will redirect
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
        <Footer />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="max-w-[1320px] mx-auto px-4">
          <h1 className="text-3xl font-heading font-light mb-2">My Orders</h1>
          {user && (
            <p className="text-muted-foreground mb-8">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found for {user.email}
            </p>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 max-w-md mx-auto">
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
            <div className="text-center py-12 bg-white rounded-lg border border-border">
              <Package size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-4">You haven't placed any orders yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Start shopping to see your orders here
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}
          
          {!error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="font-semibold text-lg">Order #{order.orderNumber || order._id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                      {order.shippingAddress?.fullName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Customer: {order.shippingAddress.fullName}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status || 'Pending'}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-semibold text-lg text-primary mt-1">
                          Total: ₹{order.total?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Payment: {order.paymentMethod?.toUpperCase() || 'N/A'} • {order.paymentStatus || 'Pending'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                        className="px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
                      >
                        <Eye size={14} />
                        {selectedOrder?._id === order._id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Order Details (Expandable) */}
                  {selectedOrder?._id === order._id && (
                    <div className="border-t border-border mt-4 pt-4">
                      <h3 className="font-semibold mb-3">Order Items</h3>
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 py-2 border-b border-border last:border-0">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=60&h=60&fit=crop'}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=60&h=60&fit=crop';
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                                {item.color && <p className="text-sm text-muted-foreground">Color: {item.color}</p>}
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} × ₹{item.price?.toLocaleString() || '0'}
                                </p>
                                <p className="text-sm font-semibold text-primary">
                                  ₹{(item.price * item.quantity)?.toLocaleString() || '0'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No items found for this order</p>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>₹{calculateSubtotal(order.items).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>FREE</span>
                        </div>
                        {order.paymentMethod === 'cod' && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span>Cash on Delivery</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-border">
                          <span>Total</span>
                          <span className="text-primary">₹{order.total?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                      
                      {order.shippingAddress && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <h3 className="font-semibold mb-2">Shipping Address</h3>
                          <p className="text-sm">{order.shippingAddress.fullName}</p>
                          <p className="text-sm text-muted-foreground">{order.shippingAddress.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                          </p>
                          <p className="text-sm text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
                          {order.shippingAddress.email && (
                            <p className="text-sm text-muted-foreground">Email: {order.shippingAddress.email}</p>
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
    </div>
  );
};

export default Orders;