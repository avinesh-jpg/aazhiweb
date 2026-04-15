/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Package, LogOut, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import BackToTop from '@/components/BackToTop';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: ''
  });

  const token = localStorage.getItem('tiinyberry_token');

  const loadUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('tiinyberry_token');
        localStorage.removeItem('tiinyberry_user');
        navigate('/');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setOrders(data.orders || []);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || ''
        });
        
        if (data.user.addresses && data.user.addresses.length > 0) {
          const addr = data.user.addresses[0];
          setAddressForm({
            fullName: addr.fullName || '',
            address: addr.address || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            phone: addr.phone || '',
            email: addr.email || ''
          });
        }
      }
    } catch (error) {
      console.error('Load user data error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    loadUserData();
  }, [token, navigate, loadUserData]);

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('tiinyberry_user', JSON.stringify(data.user));
        setEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile');
    }
  };

  const handleUpdateAddress = async () => {
    try {
      if (user.addresses && user.addresses.length > 0) {
        const addressId = user.addresses[0]._id;
        await fetch(`${API_URL}/auth/address/${addressId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      const response = await fetch(`${API_URL}/auth/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...addressForm,
          isDefault: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser({ ...user, addresses: data.addresses });
        setEditingAddress(false);
        alert('Address updated successfully!');
      }
    } catch (error) {
      console.error('Update address error:', error);
      alert('Failed to update address');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tiinyberry_token');
    localStorage.removeItem('tiinyberry_user');
    localStorage.removeItem('tiinyberry_email');
    localStorage.removeItem('tiinyberry_orders');
    navigate('/');
    window.location.reload();
  };

  const defaultAddress = user?.addresses && user.addresses.length > 0 ? user.addresses[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Navbar />
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadUserData} className="px-4 py-2 bg-primary text-white rounded-lg">
            Try Again
          </button>
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
          <h1 className="text-3xl md:text-4xl font-heading font-light mb-8">My Profile</h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white border border-border rounded-xl p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={48} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">{user?.name || 'Customer'}</h2>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium"
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full text-left px-4 py-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    My Orders ({orders.length})
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2">
              {/* Profile Info */}
              <div className="bg-white border border-border rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="p-1 hover:bg-accent rounded"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="p-1 text-primary hover:bg-primary/10 rounded"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <User size={16} /> Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      <p className="text-foreground">{user?.name || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Mail size={16} /> Email Address
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    ) : (
                      <p className="text-foreground">{user?.email || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Phone size={16} /> Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    ) : (
                      <p className="text-foreground">{user?.phone || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="bg-white border border-border rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Home size={20} /> Shipping Address
                  </h2>
                  {defaultAddress && !editingAddress && (
                    <button
                      onClick={() => setEditingAddress(true)}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Edit2 size={16} />
                      Edit Address
                    </button>
                  )}
                  {editingAddress && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAddress(false)}
                        className="p-1 hover:bg-accent rounded"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={handleUpdateAddress}
                        className="p-1 text-primary hover:bg-primary/10 rounded"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  )}
                </div>
                
                {!defaultAddress ? (
                  <div className="text-center py-8">
                    <MapPin size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No address saved yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your shipping address will appear here after your first order
                    </p>
                  </div>
                ) : editingAddress ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <input
                        type="text"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Pincode</label>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={addressForm.email}
                        onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-4">
                    <p className="font-medium">{defaultAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{defaultAddress.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Phone: {defaultAddress.phone}</p>
                    {defaultAddress.email && (
                      <p className="text-sm text-muted-foreground">Email: {defaultAddress.email}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Recent Orders */}
              <div className="bg-white border border-border rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Recent Orders</h2>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-primary hover:underline text-sm"
                  >
                    View All
                  </button>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Order #{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">₹{order.total.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

export default Profile;