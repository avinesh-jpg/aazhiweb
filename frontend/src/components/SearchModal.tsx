import { useState, useEffect, useRef } from 'react';
import { X, Search, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  productId: number;
  name: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  image: string;
  category: string;
  slug?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getProductUrl = (product: Product): string => {
  if (product.slug) {
    const cat = (product.category || 'collection').toLowerCase().replace(/ /g, '-');
    return `/collections/${cat}/products/${product.slug}`;
  }
  return `/product/${product.productId}`;
};

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term);
    onClose();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleProductClick = (product: Product) => {
    onClose();
    navigate(getProductUrl(product));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-purple-200/50 animate-scaleIn">
        
        {/* Search Input */}
        <div className="p-4 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-purple-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products... (e.g., jabla, frock, thottil)"
              className="flex-1 text-lg outline-none bg-transparent placeholder:text-gray-400 text-[#1e1b4b]"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="p-1 hover:bg-purple-100 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[60vh] custom-scroll">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block rounded-full h-6 w-6 border-2 border-purple-300 border-t-purple-600 animate-spin"></div>
            </div>
          ) : searchTerm ? (
            results.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto text-purple-300 mb-3" />
                <p className="text-gray-500">No products found for "{searchTerm}"</p>
                <p className="text-sm text-gray-400 mt-1">Try searching with different keywords</p>
              </div>
            ) : (
              <div>
                <div className="px-4 py-2 bg-purple-50/50 text-xs text-purple-600 font-medium">
                  Found {results.length} result(s)
                </div>
                {results.map((product) => (
                  <div
                    key={product.productId}
                    onClick={() => handleProductClick(product)}
                    className="flex items-center gap-4 p-4 hover:bg-purple-50/50 cursor-pointer transition-all duration-300 border-b border-purple-100 hover:translate-x-1"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=80&h=80&fit=crop';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-[#1e1b4b] hover:text-purple-600 transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        {product.badge && (
                          <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 px-2 py-0.5 rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        Category: {product.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : recentSearches.length > 0 ? (
            <div>
              <div className="flex justify-between items-center px-4 py-2 bg-purple-50/50">
                <span className="text-xs text-purple-600 font-medium">Recent Searches</span>
                <button 
                  onClick={clearRecentSearches} 
                  className="text-xs text-purple-500 hover:text-purple-600 hover:underline transition-all"
                >
                  Clear All
                </button>
              </div>
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(term)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50/50 transition-all duration-300 flex items-center gap-3 border-b border-purple-100 group"
                >
                  <Search size={14} className="text-purple-400 group-hover:text-purple-500" />
                  <span className="text-gray-700 group-hover:text-purple-600">{term}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-purple-300 mb-3 animate-float" />
              <p className="text-gray-500">Search for products</p>
              <p className="text-sm text-gray-400 mt-1">
                Try "jabla", "frock", "thottil", "towel"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-purple-100 bg-purple-50/30">
          <p className="text-xs text-gray-500 text-center">
            Press Enter to see all results
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scroll::-webkit-scrollbar-track {
          background: #f0ebfa;
          border-radius: 10px;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(145deg, #b9a9e0, #93b4e8);
          border-radius: 10px;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(145deg, #a28fd1, #7da0da);
        }
      `}</style>
    </div>
  );
};

export default SearchModal;