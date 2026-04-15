import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Link } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface Color {
  name: string;
  code: string;
  images: string[];
}

interface Product {
  _id?: string;
  productId: number;
  name: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  image: string;
  images: string[];
  colors: Color[];
  category: string;
  subcategory: string;
  age: string;
  description: string;
  sizes: string[];
  material: string;
  care: string;
  inStock: boolean;
  stockQuantity: number;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product?: Product | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductModal = ({ isOpen, onClose, onSave, product }: ProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] = useState<Array<{name: string, path: string}>>([]);
  const [formData, setFormData] = useState<Product>({
    productId: 0,
    name: '',
    price: 0,
    originalPrice: null,
    badge: null,
    image: '',
    images: [],
    colors: [],
    category: 'clothing',
    subcategory: '',
    age: '0-3',
    description: '',
    sizes: [],
    material: '',
    care: '',
    inStock: true,
    stockQuantity: 10
  });

  const [newColor, setNewColor] = useState<Color>({
    name: '',
    code: '#FFB6C1',
    images: []
  });
  const [newSize, setNewSize] = useState('');
  const [showColorForm, setShowColorForm] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [manualGalleryUrl, setManualGalleryUrl] = useState('');

  useEffect(() => {
    if (product) {
      console.log('Editing product:', product);
      setFormData({
        productId: product.productId || Date.now(),
        name: product.name || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || null,
        badge: product.badge || null,
        image: product.image || '',
        images: product.images || [],
        colors: product.colors || [],
        category: product.category || 'clothing',
        subcategory: product.subcategory || '',
        age: product.age || '0-3',
        description: product.description || '',
        sizes: product.sizes || [],
        material: product.material || '',
        care: product.care || '',
        inStock: product.inStock !== undefined ? product.inStock : true,
        stockQuantity: product.stockQuantity || 10
      });
    } else {
      setFormData({
        productId: Date.now(),
        name: '',
        price: 0,
        originalPrice: null,
        badge: null,
        image: '',
        images: [],
        colors: [],
        category: 'clothing',
        subcategory: '',
        age: '0-3',
        description: '',
        sizes: [],
        material: '',
        care: '',
        inStock: true,
        stockQuantity: 10
      });
    }
  }, [product]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (formData.category) {
        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch(`${API_URL}/subcategories/category/${formData.category}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setAvailableSubcategories(data.subcategories);
            console.log('Fetched subcategories:', data.subcategories);
          } else {
            setAvailableSubcategories([]);
          }
        } catch (error) {
          console.error('Fetch subcategories error:', error);
          setAvailableSubcategories([]);
        }
      } else {
        setAvailableSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const token = localStorage.getItem('admin_token');
    const url = product?._id 
      ? `${API_URL}/admin/products/${product._id}`
      : `${API_URL}/admin/products`;
    const method = product?._id ? 'PUT' : 'POST';
    
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
        onSave();
        onClose();
      } else {
        const error = await response.json();
        console.error('Server error:', error);
      }
    } catch (error) {
      console.error('Save product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize] });
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
  };

  const addColor = () => {
    if (newColor.name && newColor.code) {
      setFormData({
        ...formData,
        colors: [...formData.colors, { ...newColor, images: newColor.images }]
      });
      setNewColor({ name: '', code: '#FFB6C1', images: [] });
      setShowColorForm(false);
    }
  };

  const removeColor = (colorName: string) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c.name !== colorName) });
  };

  // Add manual URL for main image
  const addManualImageUrl = () => {
    if (manualImageUrl && manualImageUrl.trim()) {
      setFormData({ ...formData, image: manualImageUrl.trim() });
      setManualImageUrl('');
    }
  };

  // Add manual URL for gallery
  const addManualGalleryUrl = () => {
    if (manualGalleryUrl && manualGalleryUrl.trim() && !formData.images.includes(manualGalleryUrl.trim())) {
      setFormData({ ...formData, images: [...formData.images, manualGalleryUrl.trim()] });
      setManualGalleryUrl('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 z-10">
          <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Original Price</label>
              <input
                type="number"
                value={formData.originalPrice || ''}
                onChange={(e) => setFormData({ ...formData, originalPrice: parseInt(e.target.value) || null })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Badge</label>
              <select
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None</option>
                <option value="Bestseller">Bestseller</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="clothing">Clothing</option>
                <option value="newborn">Newborn</option>
                <option value="thottil">Thottil</option>
                <option value="bathing">Bathing</option>
                <option value="bedding">Bedding</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subcategory</label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a subcategory</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub.name} value={sub.name}>{sub.name}</option>
                ))}
              </select>
              {availableSubcategories.length === 0 && formData.category && (
                <p className="text-xs text-yellow-600 mt-1">
                  No subcategories found for this category. Add them in Subcategories tab.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age Range</label>
              <select
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="0-3">0-3 Months</option>
                <option value="3-6">3-6 Months</option>
                <option value="6-12">6-12 Months</option>
                <option value="1-10">1-10 Years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Material</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Care Instructions</label>
              <input
                type="text"
                value={formData.care}
                onChange={(e) => setFormData({ ...formData, care: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          {/* Main Image Section - Both Upload and URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Main Image</label>
            
            {/* Tab buttons */}
            <div className="flex gap-2 mb-3 border-b">
              <button
                type="button"
                className="px-3 py-1 text-sm font-medium text-primary border-b-2 border-primary"
              >
                <Upload size={14} className="inline mr-1" /> Upload File
              </button>
              <button
                type="button"
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <Link size={14} className="inline mr-1" /> Enter URL
              </button>
            </div>
            
            {/* Image Upload Component */}
            <ImageUpload
              onUpload={(url) => setFormData({ ...formData, image: url })}
              existingImages={formData.image ? [formData.image] : []}
              onRemove={() => setFormData({ ...formData, image: '' })}
            />
            
            {/* OR Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
            
            {/* Manual URL Input */}
            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-1">Enter Image URL directly</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={addManualImageUrl}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Set URL
                </button>
              </div>
            </div>
            
            {/* Main Image Preview */}
            {formData.image && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 mb-2">✓ Main image set:</p>
                <div className="relative inline-block group">
                  <img 
                    src={formData.image} 
                    alt="Main product" 
                    className="w-32 h-32 object-cover rounded-lg border-2 border-green-500 shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Product Images Gallery - Both Upload and URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Images (Gallery)</label>
            
            {/* Image Upload Component for multiple images */}
            <ImageUpload
              multiple
              onUpload={(url) => setFormData({ ...formData, images: [...formData.images, url] })}
              existingImages={formData.images}
              onRemove={(url) => setFormData({ ...formData, images: formData.images.filter(img => img !== url) })}
            />
            
            {/* OR Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR Add Image URL</span>
              </div>
            </div>
            
            {/* Manual URL Input for Gallery */}
            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-1">Enter Gallery Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={manualGalleryUrl}
                  onChange={(e) => setManualGalleryUrl(e.target.value)}
                  placeholder="https://example.com/gallery-image.jpg"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={addManualGalleryUrl}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add URL
                </button>
              </div>
            </div>
            
            {/* Gallery Images Preview */}
            {formData.images.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-2">✓ {formData.images.length} gallery image(s) in order:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={img} 
                        alt={`Gallery ${idx + 1}`} 
                        className="w-24 h-24 object-cover rounded-lg border-2 border-blue-500 shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Images will be displayed in this order on the product page
                </p>
              </div>
            )}
          </div>
          
          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium mb-1">Sizes</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Size (e.g., 0-3 months)"
                onKeyPress={(e) => e.key === 'Enter' && addSize()}
              />
              <button 
                type="button" 
                onClick={addSize} 
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.sizes.map((size) => (
                <span key={size} className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2">
                  {size}
                  <button 
                    type="button" 
                    onClick={() => removeSize(size)} 
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          {/* Colors Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Colors ({formData.colors.length})</h3>
              <button
                type="button"
                onClick={() => setShowColorForm(!showColorForm)}
                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-600 transition-colors"
              >
                <Plus size={14} /> Add Color
              </button>
            </div>
            
            {/* Existing Colors Display */}
            {formData.colors.length > 0 && (
              <div className="mb-4 space-y-3">
                {formData.colors.map((color, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-8 h-8 rounded-full border-2 shadow" style={{ background: color.code }} />
                      <span className="flex-1 font-medium">{color.name}</span>
                      <span className="text-sm text-gray-500">{color.images.length} images</span>
                      <button 
                        type="button" 
                        onClick={() => removeColor(color.name)} 
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {color.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {color.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="relative group">
                            <img 
                              src={img} 
                              alt={`${color.name} ${imgIdx + 1}`} 
                              className="w-16 h-16 object-cover rounded border-2 border-primary/30"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                              }}
                            />
                            <div className="absolute top-0 left-0 bg-primary text-white text-xs rounded-br-md px-1">
                              {imgIdx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Color Form */}
            {showColorForm && (
              <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
                <h4 className="font-medium mb-3">Add New Color</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Color Name</label>
                    <input
                      type="text"
                      value={newColor.name}
                      onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Pink, Blue, Yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Color Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColor.code}
                        onChange={(e) => setNewColor({ ...newColor, code: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="#FFB6C1"
                      />
                      <div 
                        className="w-10 h-10 rounded border shadow"
                        style={{ background: newColor.code }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Color Images Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Color Images</label>
                  <ImageUpload
                    multiple
                    onUpload={(url) => setNewColor({ ...newColor, images: [...newColor.images, url] })}
                    existingImages={newColor.images}
                    onRemove={(url) => setNewColor({ 
                      ...newColor, 
                      images: newColor.images.filter(img => img !== url) 
                    })}
                  />
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">OR Enter URL</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="colorImageUrl"
                      placeholder="https://example.com/color-image.jpg"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('colorImageUrl') as HTMLInputElement;
                        const url = input.value.trim();
                        if (url && !newColor.images.includes(url)) {
                          setNewColor({ ...newColor, images: [...newColor.images, url] });
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                    >
                      Add URL
                    </button>
                  </div>
                  {newColor.images.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600 mb-2">✓ {newColor.images.length} color image(s):</p>
                      <div className="flex flex-wrap gap-2">
                        {newColor.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={img} 
                              alt={`Color ${idx + 1}`} 
                              className="w-20 h-20 object-cover rounded-lg border-2 border-purple-500 shadow-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setNewColor({ ...newColor, images: newColor.images.filter((_, i) => i !== idx) })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowColorForm(false);
                      setNewColor({ name: '', code: '#FFB6C1', images: [] });
                    }}
                    className="px-3 py-1 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    disabled={!newColor.name}
                  >
                    Save Color
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Stock Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>In Stock</span>
              </label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;