import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/useCart';
import { ShoppingBag, Zap, TrendingDown, Clock } from 'lucide-react';

interface ComboProduct {
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
    productId: number;
  } | null;
  quantity: number;
}

interface ComboOffer {
  _id: string;
  name: string;
  description: string;
  products: ComboProduct[];
  comboPrice: number;
  originalPrice: number;
  discountPercent: number;
  badge: string;
  image: string;
  isActive: boolean;
  endDate?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ComboOffers = () => {
  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const response = await fetch(`${API_URL}/combos`);
      const data = await response.json();
      if (data.success) {
        const activeCombos = data.combos
          .filter((combo: ComboOffer) => {
            // Check if combo is active
            if (!combo.isActive) return false;
            // Check if combo has expired
            if (combo.endDate && new Date(combo.endDate) < new Date()) return false;
            // Filter out combos that have all null products
            const hasValidProducts = combo.products.some(item => item.productId !== null);
            if (!hasValidProducts) return false;
            return true;
          })
          .map((combo: ComboOffer) => ({
            ...combo,
            // Filter out null products from the products array
            products: combo.products.filter(item => item.productId !== null)
          }));
        
        setCombos(activeCombos);
      }
    } catch (error) {
      console.error('Failed to fetch combos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComboToCart = async (combo: ComboOffer) => {
    setAddingToCart(combo._id);
    
    try {
      for (const item of combo.products) {
        // Skip if productId is null (should not happen after filtering, but just in case)
        if (!item.productId) continue;
        
        const productId = item.productId.productId || parseInt(item.productId._id);
        for (let i = 0; i < item.quantity; i++) {
          await addToCart(productId, 1);
        }
      }
      alert(`${combo.name} added to cart successfully!`);
    } catch (error) {
      console.error('Failed to add combo to cart:', error);
      alert('Failed to add combo to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  const getTimeRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days left`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hours left`;
    
    return 'Ending soon';
  };

  // Loading state with skeleton UI
  if (loading) {
    return (
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <div className="h-6 w-32 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-2 animate-pulse"></div>
          <div className="h-5 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="h-52 bg-gray-200 animate-pulse"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (combos.length === 0) return null;

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto">
      <div className="text-center mb-10 md:mb-14">
        <span className="inline-block text-xs md:text-sm uppercase tracking-[0.2em] font-semibold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Save More
        </span>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light font-heading bg-gradient-to-r from-[#1e1b4b] to-[#5b21b6] bg-clip-text text-transparent">
          Combo Offers
        </h2>
        <p className="text-gray-500 mt-2">Buy together and save big!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo, index) => {
          const timeRemaining = getTimeRemaining(combo.endDate);
          // Filter valid products for this combo
          const validProducts = combo.products.filter(item => item.productId !== null);
          
          return (
            <div 
              key={combo._id} 
              className="group bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-100/50 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Combo Image */}
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-purple-100/50 to-blue-100/50">
                <img 
                  src={combo.image || 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=300&fit=crop'}
                  alt={combo.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=300&fit=crop';
                  }}
                />
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  <Zap size={12} />
                  Save {combo.discountPercent}%
                </div>
                {/* Time Remaining */}
                {timeRemaining && (
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} />
                    {timeRemaining}
                  </div>
                )}
              </div>
              
              {/* Combo Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-[#1e1b4b] group-hover:text-purple-600 transition-colors duration-300">
                  {combo.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{combo.description}</p>
                
                {/* Products in combo - with null check */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {validProducts.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                      {item.productId?.name || 'Product'} {item.quantity > 1 ? `x${item.quantity}` : ''}
                    </span>
                  ))}
                  {validProducts.length > 3 && (
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                      +{validProducts.length - 3} more
                    </span>
                  )}
                </div>
                
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    ₹{combo.comboPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 line-through">₹{combo.originalPrice.toLocaleString()}</span>
                </div>
                
                {/* Savings indicator */}
                <div className="mb-4 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700 flex items-center gap-1">
                      <TrendingDown size={14} />
                      You save
                    </span>
                    <span className="font-bold text-green-800">₹{(combo.originalPrice - combo.comboPrice).toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-green-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, combo.discountPercent)}%` }}
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddComboToCart(combo)}
                    disabled={addingToCart === combo._id || validProducts.length === 0}
                    className="flex-1 py-2.5 rounded-full font-medium 
                    border-2 border-purple-300 text-purple-600 bg-white
                    transition-all duration-300 ease-out
                    flex items-center justify-center gap-2
                    hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-400
                    hover:text-white hover:border-transparent
                    hover:scale-105 hover:shadow-md hover:shadow-purple-200/40
                    active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag 
                      size={16} 
                      className="transition-transform duration-300 group-hover:scale-110" 
                    />
                    {addingToCart === combo._id ? 'Adding...' : 'Add Combo to Cart'}
                  </button>

                  <button
                    onClick={() => navigate(`/combos/${combo._id}`)}
                    className="px-4 py-2.5 rounded-full border-2 border-purple-300 text-purple-600 font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-400 hover:text-white hover:border-transparent hover:scale-105"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default ComboOffers;