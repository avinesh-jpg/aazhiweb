/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Package, LogOut, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import BackToTop from '@/components/BackToTop';

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
        <AnnouncementBar />
        <Navbar />
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadUserData} className="px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400">
            Try Again
          </button>
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
            My Profile
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl p-6 sticky top-24 shadow-lg transition-all duration-300 hover:shadow-purple-100/50">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <User size={48} className="text-purple-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1e1b4b]">{user?.name || 'Customer'}</h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium shadow-md"
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full text-left px-4 py-2 hover:bg-purple-50 rounded-xl transition-all duration-300 text-[#1e1b4b] hover:text-purple-600"
                  >
                    My Orders ({orders.length})
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 flex items-center gap-2"
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
              <div className="bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl p-6 mb-6 shadow-lg transition-all duration-300 hover:shadow-purple-100/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    Personal Information
                  </h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-purple-500 hover:text-purple-600 transition-all duration-300 hover:scale-105"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="p-1 hover:bg-purple-100 rounded-full transition-all"
                      >
                        <X size={18} className="text-gray-500" />
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="p-1 text-purple-500 hover:bg-purple-100 rounded-full transition-all"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[#1e1b4b]">
                      <User size={16} /> Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      />
                    ) : (
                      <p className="text-[#1e1b4b]">{user?.name || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[#1e1b4b]">
                      <Mail size={16} /> Email Address
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      />
                    ) : (
                      <p className="text-[#1e1b4b]">{user?.email || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[#1e1b4b]">
                      <Phone size={16} /> Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      />
                    ) : (
                      <p className="text-[#1e1b4b]">{user?.phone || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl p-6 mb-6 shadow-lg transition-all duration-300 hover:shadow-purple-100/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    <Home size={20} /> Shipping Address
                  </h2>
                  {defaultAddress && !editingAddress && (
                    <button
                      onClick={() => setEditingAddress(true)}
                      className="flex items-center gap-2 text-purple-500 hover:text-purple-600 transition-all duration-300 hover:scale-105"
                    >
                      <Edit2 size={16} />
                      Edit Address
                    </button>
                  )}
                  {editingAddress && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAddress(false)}
                        className="p-1 hover:bg-purple-100 rounded-full transition-all"
                      >
                        <X size={18} className="text-gray-500" />
                      </button>
                      <button
                        onClick={handleUpdateAddress}
                        className="p-1 text-purple-500 hover:bg-purple-100 rounded-full transition-all"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  )}
                </div>
                
                {!defaultAddress ? (
                  <div className="text-center py-8">
                    <MapPin size={48} className="mx-auto text-purple-300 mb-3" />
                    <p className="text-gray-500">No address saved yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your shipping address will appear here after your first order
                    </p>
                  </div>
                ) : editingAddress ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#1e1b4b]">Full Name</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#1e1b4b]">Address</label>
                      <input
                        type="text"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1e1b4b]">City</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1e1b4b]">State</label>
                        <select
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80 text-[#1e1b4b]"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                          {addressForm.state && !INDIAN_STATES.includes(addressForm.state) && (
                            <option value={addressForm.state}>{addressForm.state}</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1e1b4b]">Pincode</label>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1e1b4b]">Phone</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#1e1b4b]">Email</label>
                      <input
                        type="email"
                        value={addressForm.email}
                        onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/80"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border border-purple-200 rounded-xl p-4 bg-white/50">
                    <p className="font-medium text-[#1e1b4b]">{defaultAddress.fullName}</p>
                    <p className="text-sm text-gray-600 mt-1">{defaultAddress.address}</p>
                    <p className="text-sm text-gray-600">
                      {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Phone: {defaultAddress.phone}</p>
                    {defaultAddress.email && (
                      <p className="text-sm text-gray-600">Email: {defaultAddress.email}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Recent Orders */}
              <div className="bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-purple-100/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    Recent Orders
                  </h2>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-purple-500 hover:text-purple-600 transition-all duration-300 text-sm hover:underline"
                  >
                    View All
                  </button>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-purple-300 mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-3 px-6 py-2 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="border border-purple-200 rounded-xl p-4 bg-white/50 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-[#1e1b4b]">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                              ₹{order.total.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{order.status}</p>
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