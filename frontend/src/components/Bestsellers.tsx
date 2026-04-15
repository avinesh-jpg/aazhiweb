import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/useCart";

interface Product {
  productId: number;
  name: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  image: string;
  category: string;
  sizes?: string[];
}

interface WishlistItem {
  productId: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultImages = [
  "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400&h=500&fit=crop",
];

const Bestsellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlisted, setWishlisted] = useState<number[]>([]);
  const [added, setAdded] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const data: Product[] = await response.json();
          const productsWithImages = data.map((product: Product, index: number) => ({
            ...product,
            image: product.image || defaultImages[index % defaultImages.length]
          }));
          setProducts(productsWithImages.slice(0, 4));
        } else {
          setProducts([
            { productId: 1, name: "Organic Cotton Jabla Set", price: 599, originalPrice: 799, badge: "Bestseller", image: defaultImages[0], category: "clothing", sizes: ["0-3 months", "3-6 months"] },
            { productId: 2, name: "Newborn Essential Kit", price: 1299, originalPrice: null, badge: "New", image: defaultImages[1], category: "essentials", sizes: ["One Size"] },
            { productId: 3, name: "Muslin Summer Frock", price: 749, originalPrice: 949, badge: null, image: defaultImages[2], category: "clothing", sizes: ["3-6 months", "6-9 months"] },
            { productId: 4, name: "Muslin Hooded Towel", price: 499, originalPrice: null, badge: "Bestseller", image: defaultImages[3], category: "bath", sizes: ["One Size"] },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
    
    // For quick add, select the first size if available
    let selectedSize = '';
    if (product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size') {
      selectedSize = product.sizes[0];
    }
    
    const success = await addToCart(product.productId, 1, selectedSize);
    
    if (success) {
      setAdded((prev) => [...prev, product.productId]);
      setTimeout(() => setAdded((prev) => prev.filter((x) => x !== product.productId)), 1800);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto pt-0">
        <div className="text-center">Loading products...</div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto pt-0">
      <div className="mb-10 md:mb-14 reveal">
        <span className="section-label">Our most loved</span>
        <h2 className="section-heading">Bestsellers</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <div 
            key={product.productId} 
            className={`group product-card cursor-pointer reveal reveal-d${index}`}
            onClick={() => handleProductClick(product.productId)}
          >
            <div className="relative overflow-hidden rounded-xl bg-muted" style={{ aspectRatio: "3/4" }}>
              <img 
                src={product.image} 
                alt={product.name} 
                loading="lazy" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
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
              <h3 className="text-base font-medium text-foreground leading-snug" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {product.name}
              </h3>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[0.85rem] font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
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
    </section>
  );
};

export default Bestsellers;