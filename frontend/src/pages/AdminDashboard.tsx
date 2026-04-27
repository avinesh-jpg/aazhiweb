/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Users, ShoppingBag, DollarSign, TrendingUp, 
  Eye, Edit, Trash2, Plus, LogOut, X, List, Truck, Gift 
} from 'lucide-react';
import ProductModal from '@/components/Admin/ProductModal';
import SubcategoryManager from '@/components/Admin/SubcategoryManager';
import ShippingSettings from '@/components/Admin/ShippingSettings';
import ComboManager from '@/components/Admin/ComboManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'users' | 'subcategories' | 'shipping' | 'combos'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    fetchStats();
    fetchOrders();
    fetchProducts();
    fetchUsers();
  }, [navigate]);

  const fetchStats = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setAllOrders(data.orders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true);
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (error) {
      console.error('Update order error:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const printInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #2c3e50; margin: 0; }
          .order-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #2c3e50; color: white; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Aazhi</h1>
          <p>Order Invoice</p>
        </div>
        <div class="order-info">
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod?.toUpperCase() || 'RAZORPAY'}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus?.toUpperCase() || 'PAID'}</p>
        </div>
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td>${item.name}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toLocaleString()}</td>
                <td>₹{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Subtotal: ₹${order.subtotal.toLocaleString()}</p>
          <p>Shipping: ${order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString()}`}</p>
          <p>Total: ₹${order.total.toLocaleString()}</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with Aazhi!</p>
          <p>For any queries, contact: support@aazhi.com</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const token = localStorage.getItem('admin_token');
      try {
        await fetch(`${API_URL}/admin/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchProducts();
      } catch (error) {
        console.error('Delete product error:', error);
      }
    }
  };

  const handleSaveProduct = () => {
    fetchProducts();
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const filterOrders = (status: string) => {
    if (status === 'all') {
      setOrders(allOrders);
    } else {
      setOrders(allOrders.filter(order => order.status === status));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary">Aazhi</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Package size={18} />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'products' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            }`}
          >
            <ShoppingBag size={18} />
            Products
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Users size={18} />
            Users
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'subcategories' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            }`}
          >
            <List size={18} />
            Subcategories
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'shipping' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Truck size={18} />
            Shipping
          {/* ... </button>
          <button
            onClick={() => setActiveTab('combos')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'combos' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Gift size={18} />
            Combos
          </button>
          */}
          <div className="pt-4 border-t mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <Package size={32} className="text-primary/60" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users size={32} className="text-primary/60" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Products</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <ShoppingBag size={32} className="text-primary/60" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign size={32} className="text-primary/60" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recentOrders?.map((order: any) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm">{order.userId?.name || order.guestName || 'Guest'}</td>
                        <td className="px-6 py-4 text-sm">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab - Same as before */}
        {activeTab === 'orders' && (
          // ... (keep your existing orders tab code)
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Orders Management</h1>
              <div className="flex gap-2">
                <select 
                  className="px-3 py-2 border rounded-lg"
                  onChange={(e) => filterOrders(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button 
                  onClick={fetchOrders}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{order.userId?.name || order.guestName || 'Guest'}</div>
                          <div className="text-xs text-muted-foreground">{order.userId?.email || order.guestEmail || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">{order.items?.length || 0}</td>
                        <td className="px-6 py-4 text-sm font-medium">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.paymentStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                            disabled={updatingStatus}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => viewOrderDetails(order)} className="text-primary hover:text-primary/80">
                              <Eye size={18} />
                            </button>
                            <button onClick={() => printInvoice(order)} className="text-gray-600 hover:text-gray-800">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                                <path d="M6 9V3h12v6"/>
                                <rect x="6" y="15" width="12" height="6" rx="2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowOrderDetails(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <button onClick={() => setShowOrderDetails(false)} className="p-1 hover:bg-gray-100 rounded">
                      <X size={24} />
                    </button>
                  </div>
                  {/* Order details content */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{selectedOrder.paymentMethod || 'Razorpay'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <p className={`font-medium ${selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedOrder.paymentStatus || 'pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Status</p>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                        className="mt-1 px-2 py-1 rounded text-sm font-medium border"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  {/* Add more order details as needed */}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Products Management</h1>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subcategory</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                        <td className="px-6 py-4 text-sm capitalize">{product.category}</td>
                        <td className="px-6 py-4 text-sm">{product.subcategory || '-'}</td>
                        <td className="px-6 py-4 text-sm">₹{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-800">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-800">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Users Management</h1>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Mobile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{user.name}</td>
                        <td className="px-6 py-4 text-sm">{user.email || '-'}</td>
                        <td className="px-6 py-4 text-sm">{user.mobileNumber || user.phone || '-'}</td>
                        <td className="px-6 py-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Subcategories Tab */}
        {activeTab === 'subcategories' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Subcategories Management</h1>
            <SubcategoryManager />
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Shipping Settings</h1>
            <ShippingSettings />
          </div>
        )}

        {/* Combos Tab */}
        {activeTab === 'combos' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Combo Offers</h1>
            <ComboManager />
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
};

export default AdminDashboard;
