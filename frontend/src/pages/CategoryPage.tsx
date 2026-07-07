import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/useCart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import AnnouncementBar from "@/components/AnnouncementBar";
import { toast } from "sonner";

interface Color {
  name: string;
  code: string;
  images: string[];
}

interface Size {
  name: string;
  stock: number;
}

interface Product {
  _id?: string;
  productId: number;
  name: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  image: string;
  images?: string[];
  category: string;
  age?: string;
  description?: string;
  sizes?: Size[] | string[];
  colors?: Color[];
  subcategory?: string;
  inStock?: boolean;
  stockQuantity?: number;
  slug?: string;
}

interface WishlistItem {
  productId: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ✅ Helper: Get product URL (without /product)
const getProductUrl = (product: Product): string => {
  if (product.slug) {
    let url = `/${product.category?.toLowerCase().replace(/ /g, '-')}`;
    if (product.subcategory) {
      url += `/${product.subcategory?.toLowerCase().replace(/ /g, '-')}`;
    }
    url += `/${product.slug}`;
    return url;
  }
  // Fallback to ID-based URL (keep /product for compatibility)
  return `/product/${product.productId}`;
};

const CategoryPage = () => {
  const { type, value } = useParams<{ type: string; value: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState<number[]>([]);
  const [added, setAdded] = useState<number[]>([]);
  const { addToCart } = useCart();

  console.log('CategoryPage rendered with:', { type, value });

  const getPageTitle = () => {
    if (type === 'age') {
      const ageMap: { [key: string]: string } = {
        '0-24': '0-3 Months',
        '2-12': '2-12 years',
        '6-12': '6-12 Months',
        '1-10': '1-10 Years'
      };
      return ageMap[value || ''] || 'Shop by Age';
    }
    if (type === 'collection') {
      const collectionMap: { [key: string]: string } = {
        'newborn': 'New Born Collection',
        'clothing': 'Clothing Collection',
        'thottil': 'Thottil Collection',
        'bathing': 'Bathing Essentials',
        'bedding': 'Bedding Collection',
        'accessories': 'Nursery & Accessories'
      };
      return collectionMap[value || ''] || 'Shop by Collection';
    }
    if (type === 'subcategory') {
      return value || 'Products';
    }
    return 'Products';
  };

  // Helper function to get total stock from sizes
  const getTotalStock = (product: Product): number => {
    if (!product.sizes || product.sizes.length === 0) {
      return product.stockQuantity || 0;
    }
    
    if (typeof product.sizes[0] === 'object' && product.sizes[0] !== null && 'stock' in product.sizes[0]) {
      return (product.sizes as Size[]).reduce((total, size) => total + size.stock, 0);
    }
    
    return (product.sizes as string[]).length > 0 ? 10 : 0;
  };

  const isProductInStock = (product: Product): boolean => {
    if (product.inStock === false) return false;
    
    if (!product.sizes || product.sizes.length === 0) {
      return (product.stockQuantity || 0) > 0;
    }
    
    if (typeof product.sizes[0] === 'object' && product.sizes[0] !== null && 'stock' in product.sizes[0]) {
      return (product.sizes as Size[]).some(size => size.stock > 0);
    }
    
    return true;
  };

  const getLowStockInfo = (product: Product): { hasLowStock: boolean; lowestStock: number; sizeName?: string } => {
    if (product.sizes && product.sizes.length > 0 && 
        typeof product.sizes[0] === 'object' && 
        product.sizes[0] !== null && 
        'stock' in product.sizes[0]) {
      const sizes = product.sizes as Size[];
      const sizesWithStock = sizes.filter(size => size.stock > 0 && size.stock <= 3);
      
      if (sizesWithStock.length > 0) {
        const lowest = sizesWithStock.reduce((min, size) => size.stock < min.stock ? size : min, sizesWithStock[0]);
        return { hasLowStock: true, lowestStock: lowest.stock, sizeName: lowest.name };
      }
    }
    
    if (product.stockQuantity !== undefined && product.stockQuantity <= 3 && product.stockQuantity > 0) {
      return { hasLowStock: true, lowestStock: product.stockQuantity, sizeName: undefined };
    }
    
    return { hasLowStock: false, lowestStock: 0 };
  };

  const getSizesDisplay = (product: Product): string => {
    if (!product.sizes || product.sizes.length === 0) return '';
    
    if (typeof product.sizes[0] === 'object' && product.sizes[0] !== null && 'stock' in product.sizes[0]) {
      const sizes = product.sizes as Size[];
      const availableSizes = sizes.filter(size => size.stock > 0).map(size => size.name);
      if (availableSizes.length === 0) return '';
      if (availableSizes.length === 1) return availableSizes[0];
      if (availableSizes.length <= 3) return availableSizes.join(', ');
      return `${availableSizes.slice(0, 3).join(', ')} +${availableSizes.length - 3}`;
    }
    
    const sizes = product.sizes as string[];
    if (sizes.length === 1) return sizes[0];
    if (sizes.length <= 3) return sizes.join(', ');
    return `${sizes.slice(0, 3).join(', ')} +${sizes.length - 3}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = `${API_URL}/products`;
        
        if (type === 'age' && value) {
          url = `${API_URL}/products/age/${value}`;
        } else if (type === 'collection' && value) {
          url = `${API_URL}/products/category/${value}`;
        } else if (type === 'subcategory' && value) {
          url = `${API_URL}/products/subcategory/${value}`;
        }
        
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        let productsArray: Product[] = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data.success && Array.isArray(data.products)) {
          productsArray = data.products;
        } else if (data.products && Array.isArray(data.products)) {
          productsArray = data.products;
        } else {
          productsArray = [];
        }
        
        console.log('Products array:', productsArray.length);
        setProducts(productsArray);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [type, value]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const sessionId = localStorage.getItem('tiinyberry_session_id');
      if (!sessionId) return;
      
      try {
        const response = await fetch(`${API_URL}/wishlist`, {
          headers: { 'x-session-id': sessionId }
        });
        if (response.ok) {
          const data: WishlistItem[] = await response.json();
          setWishlisted(data.map(item => item.productId));
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    };
    fetchWishlist();
  }, []);

  const toggleWish = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const sessionId = localStorage.getItem('tiinyberry_session_id');
    if (!sessionId) return;

    const isWishlisted = wishlisted.includes(id);
    
    try {
      if (isWishlisted) {
        await fetch(`${API_URL}/wishlist/remove/${id}`, {
          method: 'DELETE',
          headers: { 'x-session-id': sessionId }
        });
        setWishlisted(wishlisted.filter(x => x !== id));
        toast.success('Removed from wishlist');
      } else {
        await fetch(`${API_URL}/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId
          },
          body: JSON.stringify({ productId: id })
        });
        setWishlisted([...wishlisted, id]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error('Something went wrong');
    }
  };

  const handleAdd = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isProductInStock(product)) {
      toast.error('This product is out of stock!');
      return;
    }
    
    let selectedSize = '';
    let selectedColor = '';
    
    if (product.sizes && product.sizes.length > 0) {
      if (typeof product.sizes[0] === 'object' && product.sizes[0] !== null && 'stock' in product.sizes[0]) {
        const availableSize = (product.sizes as Size[]).find(size => size.stock > 0);
        if (availableSize) {
          selectedSize = availableSize.name;
        }
      } else if (product.sizes[0] !== 'One Size') {
        selectedSize = product.sizes[0] as string;
      } else {
        selectedSize = 'One Size';
      }
    }
    
    if (product.colors && product.colors.length > 0) {
      selectedColor = product.colors[0].name;
    }
    
    const success = await addToCart(product.productId, 1, selectedSize, selectedColor);
    
    if (success) {
      setAdded((prev) => [...prev, product.productId]);
      toast.success(`Added ${product.name} to cart!`);
      setTimeout(() => setAdded((prev) => prev.filter((x) => x !== product.productId)), 1800);
    } else {
      toast.error('Failed to add to cart');
    }
  };

  // ✅ UPDATED: Click handler uses URL without /product
  const handleProductClick = (product: Product) => {
    navigate(getProductUrl(product));
  };

  const defaultImage = "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=500&fit=crop";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
      <AnnouncementBar />
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-purple-500 transition-all duration-300 mb-4 hover:-translate-x-1"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Home</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-light font-heading bg-gradient-to-r from-[#1e1b4b] to-[#5b21b6] bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
            {!loading && !error && (
              <p className="text-gray-500 mt-2">
                {products.length} products found
              </p>
            )}
          </div>

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 font-semibold mb-2">Error loading products:</p>
                <p className="text-red-500 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-purple-300 mb-4 animate-float" />
              <p className="text-gray-500">No products found in this category.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-purple-300/30 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400"
              >
                Continue Shopping
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => {
                const inStock = isProductInStock(product);
                const lowStockInfo = getLowStockInfo(product);
                const sizesDisplay = getSizesDisplay(product);
                
                return (
                  <div 
                    key={product.productId || product._id} 
                    className={`group cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                      !inStock ? 'opacity-70' : ''
                    }`}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-purple-50/50" style={{ aspectRatio: "3/4" }}>
                      <img 
                        src={product.image || defaultImage} 
                        alt={product.name} 
                        loading="lazy" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = defaultImage;
                        }}
                      />
                      
                      {product.badge && inStock && (
                        <span className="absolute top-3 left-3 text-[0.58rem] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 text-white shadow-md">
                          {product.badge}
                        </span>
                      )}
                      
                      {inStock && lowStockInfo.hasLowStock && (
                        <span className="absolute top-3 right-3 text-[0.58rem] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-orange-500 text-white shadow-md animate-pulse">
                          Only {lowStockInfo.lowestStock} left!
                        </span>
                      )}
                      
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-white font-bold text-sm uppercase tracking-wider px-4 py-2 bg-red-600 rounded-full rotate-12 shadow-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      
                      {inStock && (
                        <button
                          onClick={(e) => toggleWish(product.productId, e)}
                          className={`absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 ${
                            wishlisted.includes(product.productId) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                          }`}
                          aria-label="Wishlist"
                        >
                          <Heart size={14} fill={wishlisted.includes(product.productId) ? "currentColor" : "none"} />
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-3.5">
                      <h3 className="text-base font-medium text-[#1e1b4b] leading-snug font-heading hover:text-purple-600 transition-colors duration-200">
                        {product.name}
                      </h3>
                      
                      {sizesDisplay && (
                        <p className="text-xs text-gray-400 mt-1">
                          {sizesDisplay}
                        </p>
                      )}
                      
                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {product.description.substring(0, 60)}...
                        </p>
                      )}
                      
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`text-[0.85rem] font-bold ${
                          !inStock 
                            ? 'text-gray-400' 
                            : 'bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'
                        }`}>
                          Rs. {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[0.78rem] text-gray-400 line-through">
                            Rs. {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {inStock && lowStockInfo.hasLowStock && (
                        <p className="text-xs text-orange-600 font-medium mt-1 animate-pulse">
                          ⚡ Only {lowStockInfo.lowestStock} left {lowStockInfo.sizeName ? `in ${lowStockInfo.sizeName}` : 'in stock'} - order soon!
                        </p>
                      )}
                      
                      {!inStock ? (
                        <button
                          disabled
                          className="w-full mt-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] rounded-full bg-gray-200 text-gray-400 cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleAdd(product, e)}
                          className={`w-full mt-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] rounded-full transition-all duration-300 ${
                            added.includes(product.productId) 
                              ? "bg-gradient-to-r from-purple-500 to-purple-400 text-white shadow-md" 
                              : "border-2 border-purple-200 text-gray-500 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-400 hover:border-transparent hover:text-white hover:shadow-md"
                          }`}
                        >
                          {added.includes(product.productId) ? "Added! ✓" : "Add to Cart"}
                        </button>
                      )}
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

export default CategoryPage;