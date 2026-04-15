import { useState, useEffect, useCallback } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GuestOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const mobileNumber = localStorage.getItem('tiinyberry_mobile');

  const fetchOrders = useCallback(async () => {
    if (!mobileNumber) {
      window.location.href = '/';
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/otp/my-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber })
      });
      
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        localStorage.setItem('tiinyberry_orders', JSON.stringify(data.orders));
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  }, [mobileNumber]);

  useEffect(() => {
    if (!mobileNumber) {
      window.location.href = '/';
      return;
    }
    
    // Load from localStorage first
    const savedOrders = localStorage.getItem('tiinyberry_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
      setLoading(false);
    }
    
    fetchOrders();
  }, [mobileNumber, fetchOrders]);

  // Rest of the component remains the same...
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'confirmed': return <CheckCircle size={20} className="text-green-500" />;
      case 'shipped': return <Truck size={20} className="text-blue-500" />;
      case 'delivered': return <CheckCircle size={20} className="text-green-600" />;
      default: return <Package size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="max-w-[1320px] mx-auto px-4">
          <h1 className="text-3xl font-heading font-light mb-2">My Orders</h1>
          <p className="text-muted-foreground mb-8">{orders.length} orders found</p>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-4">No orders found for this mobile number</p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="font-semibold text-lg">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-semibold text-lg text-primary mt-1">
                          Total: ₹{order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuestOrders;