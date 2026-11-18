import { useState, useEffect } from 'react';
import { Save, Truck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ShippingSettings = () => {
  const [settings, setSettings] = useState({
    freeShippingThreshold: 3000,
    tamilNaduShippingRate: 70,
    otherStatesShippingRate: 80,
    standardShippingRate: 70,
    expressShippingRate: 200,
    internationalShippingRate: 500
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/shipping/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/shipping/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        alert('Shipping settings saved successfully!');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Truck size={24} className="text-primary" />
        <h2 className="text-xl font-bold">Shipping Settings</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Free Shipping Threshold (₹)</label>
          <input
            type="number"
            value={settings.freeShippingThreshold}
            onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <p className="text-xs text-muted-foreground mt-1">Orders above this amount get free shipping</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100">
            <label className="block text-sm font-semibold text-purple-900 mb-1">
              Tamil Nadu Shipping Rate (₹)
            </label>
            <input
              type="number"
              value={settings.tamilNaduShippingRate ?? 70}
              onChange={(e) => setSettings({ ...settings, tamilNaduShippingRate: parseInt(e.target.value) || 0, standardShippingRate: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            />
            <p className="text-xs text-purple-600 mt-1">Delivery fee for orders within Tamil Nadu</p>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
            <label className="block text-sm font-semibold text-blue-900 mb-1">
              Other States Shipping Rate (₹)
            </label>
            <input
              type="number"
              value={settings.otherStatesShippingRate ?? 80}
              onChange={(e) => setSettings({ ...settings, otherStatesShippingRate: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            />
            <p className="text-xs text-blue-600 mt-1">Delivery fee for all other states & UTs across India</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Express Shipping Rate (₹)</label>
          <input
            type="number"
            value={settings.expressShippingRate}
            onChange={(e) => setSettings({ ...settings, expressShippingRate: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">International Shipping Rate (₹)</label>
          <input
            type="number"
            value={settings.internationalShippingRate}
            onChange={(e) => setSettings({ ...settings, internationalShippingRate: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default ShippingSettings;