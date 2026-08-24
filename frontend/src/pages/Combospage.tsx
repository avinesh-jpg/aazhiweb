/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, TrendingDown, Clock, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/useCart';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import BackToTop from '@/components/BackToTop';

interface ComboProduct {
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
    productId?: number;
  };
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

const CombosPage = () => {
  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToCart, fetchCart } = useCart();

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const response = await fetch(`${API_URL}/combos`);
      const data = await response.json();
      if (data.success) {
        const enrichedCombos = await Promise.all(
          data.combos.map(async (combo: ComboOffer) => {
            const enrichedProducts = await Promise.all(
              combo.products.map(async (item) => {
                if (!item.productId?.productId && item.productId?._id) {
                  try {
                    const productRes = await fetch(`${API_URL}/products/product/${item.productId._id}`);
                    const fullProduct = await productRes.json();
                    return {
                      ...item,
                      productId: {
                        _id: fullProduct._id,
                        name: fullProduct.name,
                        price: fullProduct.price,
                        image: fullProduct.image,
                        productId: fullProduct.productId
                      }
                    };
                  } catch (err) {
                    console.error('Failed to fetch product:', item.productId?._id, err);
                    return item;
                  }
                }
                return item;
              })
            );
            return { ...combo, products: enrichedProducts };
          })
        );

        const activeCombos = enrichedCombos.filter((combo: ComboOffer) => {
          if (!combo.isActive) return false;
          if (combo.endDate && new Date(combo.endDate) < new Date()) return false;
          return true;
        });
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
        let numericProductId = item.productId?.productId;
        
        if (!numericProductId && item.productId?._id) {
          console.log(`Fetching product details for: ${item.productId.name}`);
          const productRes = await fetch(`${API_URL}/products/product/${item.productId._id}`);
          const fullProduct = await productRes.json();
          numericProductId = fullProduct.productId;
          
          if (!numericProductId) {
            console.error('Still missing productId after fetch:', fullProduct);
            alert(`Product "${item.productId.name}" is missing productId. Please contact support.`);
            continue;
          }
        }
        
        if (!numericProductId) {
          console.error('Missing productId for:', item.productId?.name);
          alert(`Could not add "${item.productId?.name}" to cart. Product ID missing.`);
          continue;
        }
        
        console.log(`Adding to cart: ${item.productId.name} (ID: ${numericProductId}) x${item.quantity}`);
        
        const success = await addToCart(
          numericProductId,
          item.quantity,
          '',
          '',
          ''
        );
        
        if (!success) {
          throw new Error(`Failed to add ${item.productId.name} to cart`);
        }
      }
      
      if (fetchCart) await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'cartUpdated' }));
      
      alert(`${combo.name} added to cart successfully!`);
    } catch (error: any) {
      console.error('Failed to add combo to cart:', error);
      alert(error.message || 'Failed to add combo to cart. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
      <AnnouncementBar />
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-purple-500 transition-all duration-300 mb-6 text-sm hover:-translate-x-1"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="text-center mb-10 md:mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] mb-2 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Save More
            </span>
            <h1 className="text-3xl md:text-4xl font-light bg-gradient-to-r from-[#1e1b4b] to-[#5b21b6] bg-clip-text text-transparent">
              Combo Offers
            </h1>
            <p className="text-gray-500 mt-2">Buy together and save big!</p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="inline-block rounded-full h-8 w-8 border-2 border-purple-300 border-t-purple-600 animate-spin" />
            </div>
          )}

          {!loading && combos.length === 0 && (
            <div className="text-center py-24">
              <p className="text-gray-500 text-lg">No combo offers available right now.</p>
              <button 
                onClick={() => navigate('/')} 
                className="mt-4 text-purple-500 hover:text-purple-600 hover:underline transition-all text-sm"
              >
                Back to Home
              </button>
            </div>
          )}

          {!loading && combos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combos.map((combo) => {
                const timeRemaining = getTimeRemaining(combo.endDate);
                return (
                  <div
                    key={combo._id}
                    className="group bg-white/70 backdrop-blur-md border border-purple-200/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-100/50"
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-purple-100/50 to-blue-100/50">
                      <img
                        src={combo.image || 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=300&fit=crop'}
                        alt={combo.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Zap size={12} />
                        Save {combo.discountPercent}%
                      </div>
                      {timeRemaining && (
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Clock size={12} />
                          {timeRemaining}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-[#1e1b4b] group-hover:text-purple-600 transition-colors">
                        {combo.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{combo.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {combo.products.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                            {item.productId?.name || 'Product'} {item.quantity > 1 ? `x${item.quantity}` : ''}
                          </span>
                        ))}
                        {combo.products.length > 3 && (
                          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                            +{combo.products.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                          ₹{combo.comboPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 line-through">₹{combo.originalPrice.toLocaleString()}</span>
                      </div>

                      <div className="mb-4 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700 flex items-center gap-1">
                            <TrendingDown size={14} />
                            You save
                          </span>
                          <span className="font-bold text-green-800">
                            ₹{(combo.originalPrice - combo.comboPrice).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-green-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                            style={{ width: `${Math.min(100, combo.discountPercent)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAddComboToCart(combo)}
                          disabled={addingToCart === combo._id}
                          className="flex-1 py-2.5 rounded-full font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400 hover:scale-105 hover:-translate-y-0.5 hover:shadow-purple-300/30"
                        >
                          <ShoppingBag size={16} className="transition-transform group-hover/btn:scale-110" />
                          {addingToCart === combo._id ? 'Adding...' : 'Add to Cart'}
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
          )}
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default CombosPage;