import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';

interface Subcategory {
  _id: string;
  name: string;
  category: string;
  path: string;
  order: number;
  isActive: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = [
  { value: 'newborn', label: 'New Born' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'thottil', label: 'Thottil' },
  { value: 'bathing', label: 'Bathing' },
  { value: 'bedding', label: 'Bedding' },
  { value: 'accessories', label: 'Nursery & Accessories' }
];

const SubcategoryManager = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'newborn',
    path: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_URL}/subcategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSubcategories(data.subcategories);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const url = editingItem 
      ? `${API_URL}/subcategories/${editingItem._id}`
      : `${API_URL}/subcategories`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchSubcategories();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      const token = localStorage.getItem('admin_token');
      try {
        await fetch(`${API_URL}/subcategories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchSubcategories();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleEdit = (item: Subcategory) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      path: item.path,
      order: item.order,
      isActive: item.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'newborn',
      path: '',
      order: 0,
      isActive: true
    });
  };

  // Group subcategories by category
  const groupedSubcategories = subcategories.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Subcategory[]>);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Subcategories Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Subcategory
        </button>
      </div>

      {/* Display subcategories by category */}
      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat.value} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b">
              <h3 className="font-semibold text-lg">{cat.label}</h3>
              <p className="text-sm text-muted-foreground">
                {groupedSubcategories[cat.value]?.length || 0} subcategories
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Path</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupedSubcategories[cat.value]?.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{item.name}</td>
                      <td className="px-6 py-4 text-sm font-mono text-xs">{item.path}</td>
                      <td className="px-6 py-4 text-sm">{item.order}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!groupedSubcategories[cat.value] || groupedSubcategories[cat.value].length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No subcategories yet. Click "Add Subcategory" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Subcategory' : 'Add Subcategory'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., New Born Essential Kit"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Path (URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., /category/collection/newborn"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: /category/collection/newborn or /category/age/0-3
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm">Active (visible in navbar)</label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryManager;