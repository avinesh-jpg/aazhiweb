import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/useCart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import AnnouncementBar from "@/components/AnnouncementBar";

interface Color {
  name: string;
  code: string;
  images: string[];
}

interface Product {
  productId: number;
  name: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  image: string;
  category: string;
  subcategory?: string;
  age?: string;
  description?: string;
  sizes?: string[];
  colors?: Color[];
}

interface WishlistItem {
  productId: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        '0-3': 'Newborn (0-3 Months)',
        '3-6': '3-6 Months',
        '6-12': '6-12 Months',
        '1-10': '1-10 Years'
      };
      return ageMap[value || ''] || 'Shop by Age';
    }
    if (type === 'collection') {
      const collectionMap: { [key: string]: string } = {
        'thottil': 'Thottil Collection',
        'clothing': 'Clothing Collection',
        'bathing': 'Bathing Essentials',
        'bedding': 'Bedding Collection',
        'newborn': 'Newborn Essentials',
        'accessories': 'Baby Accessories',
        'essentials': 'Essential Kits'
      };
      return collectionMap[value || ''] || 'Shop by Collection';
    }
    if (type === 'subcategory') {
      // Format subcategory name for display
      return value ? value.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') : 'Products';
    }
    return 'Products';
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
        console.log('Received products:', data.length);
        setProducts(data);
        
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
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleAdd = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For category page quick add, use default values
    let selectedSize = '';
    let selectedColor = '';
    
    // If product has sizes and not "One Size", use first size
    if (product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size') {
      selectedSize = product.sizes[0];
    }
    
    // If product has colors, use first color
    if (product.colors && product.colors.length > 0) {
      selectedColor = product.colors[0].name;
    }
    
    const success = await addToCart(product.productId, 1, selectedSize, selectedColor);
    
    if (success) {
      setAdded((prev) => [...prev, product.productId]);
      setTimeout(() => setAdded((prev) => prev.filter((x) => x !== product.productId)), 1800);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const defaultImage = "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=500&fit=crop";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Home</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-light text-foreground font-heading">
              {getPageTitle()}
            </h1>
            {!loading && !error && (
              <p className="text-muted-foreground mt-2">
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
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found in this category.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <div 
                  key={product.productId} 
                  className="group product-card cursor-pointer"
                  onClick={() => handleProductClick(product.productId)}
                >
                  <div className="relative overflow-hidden rounded-xl bg-muted" style={{ aspectRatio: "3/4" }}>
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
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[0.58rem] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => toggleWish(product.productId, e)}
                      className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full transition-all opacity-0 group-hover:opacity-100 ${wishlisted.includes(product.productId) ? "text-red-500" : "text-muted-foreground"}`}
                      aria-label="Wishlist"
                    >
                      <Heart size={14} fill={wishlisted.includes(product.productId) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="mt-3.5">
                    <h3 className="text-base font-medium text-foreground leading-snug font-heading">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[0.85rem] font-bold text-primary">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[0.78rem] text-muted-foreground line-through">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAdd(product, e)}
                      className={`w-full mt-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] rounded-sm border transition-all duration-300 ${
                        added.includes(product.productId) 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-border text-muted-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground"
                      }`}
                    >
                      {added.includes(product.productId) ? "Added! ✓" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
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