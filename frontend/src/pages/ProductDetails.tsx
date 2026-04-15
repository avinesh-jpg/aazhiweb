import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Minus, Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
  _id?: string;
  productId: number;
  name: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  image: string;
  images?: string[];
  colors?: Color[];
  category: string;
  age?: string;
  description?: string;
  sizes?: string[];
  material?: string;
  care?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [sizeError, setSizeError] = useState('');
  const [wishlisted, setWishlisted] = useState<number[]>([]);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/products/product/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Product fetched:', data);
          setProduct(data);
          
          // Set default size if available
          if (data.sizes && data.sizes.length > 0) {
            if (data.sizes[0] === 'One Size') {
              setSelectedSize('One Size');
            } else {
              setSelectedSize(data.sizes[0]);
            }
          }
          
          // Set default color if available
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0]);
            if (data.colors[0].images && data.colors[0].images.length > 0) {
              setSelectedImage(data.colors[0].images[0]);
            }
          } else {
            setSelectedImage(data.image);
          }
          
          // Fetch related products
          const relatedResponse = await fetch(`${API_URL}/products/category/${data.category}`);
          if (relatedResponse.ok) {
            const allRelated = await relatedResponse.json();
            const filtered = allRelated.filter((p: Product) => p.productId !== data.productId);
            setRelatedProducts(filtered.slice(0, 4));
          }
        } else {
          console.error('Product not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      const sessionId = localStorage.getItem('tiinyberry_session_id');
      if (!sessionId) return;
      
      try {
        const response = await fetch(`${API_URL}/wishlist`, {
          headers: { 'x-session-id': sessionId }
        });
        if (response.ok) {
          const data = await response.json();
          setWishlisted(data.map((item: { productId: string }) => parseInt(item.productId)));
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    };
    fetchWishlist();
  }, []);

  const toggleWish = async () => {
    if (!product) return;
    
    const sessionId = localStorage.getItem('tiinyberry_session_id');
    if (!sessionId) return;

    const isWishlisted = wishlisted.includes(product.productId);
    
    try {
      if (isWishlisted) {
        await fetch(`${API_URL}/wishlist/remove/${product.productId}`, {
          method: 'DELETE',
          headers: { 'x-session-id': sessionId }
        });
        setWishlisted(wishlisted.filter(x => x !== product.productId));
      } else {
        await fetch(`${API_URL}/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId
          },
          body: JSON.stringify({ productId: product.productId })
        });
        setWishlisted([...wishlisted, product.productId]);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
    if (color.images && color.images.length > 0) {
      setSelectedImage(color.images[0]);
      setCurrentImageIndex(0);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if size is required
    const hasSizes = product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size';
    
    if (hasSizes && !selectedSize) {
      setSizeError('Please select a size');
      return;
    }
    
    setSizeError('');
    const colorName = selectedColor?.name || '';
    // Also store the selected color's image URL in cart
    const colorImage = selectedColor?.images?.[0] || product.image;
    
    const success = await addToCart(product.productId, quantity, selectedSize, colorName, colorImage);
    
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    const hasSizes = product?.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size';
    if (hasSizes && !selectedSize) {
      setSizeError('Please select a size');
      return;
    }
    await handleAddToCart();
    navigate('/cart');
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleThumbnailClick = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const nextImage = () => {
    const currentImages = selectedColor?.images || product?.images || [product?.image || ''];
    const nextIndex = (currentImageIndex + 1) % currentImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(currentImages[nextIndex]);
  };

  const prevImage = () => {
    const currentImages = selectedColor?.images || product?.images || [product?.image || ''];
    const prevIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(currentImages[prevIndex]);
  };

  const defaultImage = "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&h=800&fit=crop";
  const currentImages = selectedColor?.images || product?.images || [product?.image || defaultImage];
  const hasMultipleImages = currentImages.length > 1;
  const hasColors = product?.colors && product.colors.length > 0;

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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-heading">Product not found</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const hasSizes = product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size';

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
            <span className="mx-2">/</span>
            <button onClick={() => navigate(`/category/collection/${product.category}`)} className="hover:text-primary">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </button>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Product Images with Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl bg-muted" style={{ aspectRatio: "3/4" }}>
                <img 
                  src={selectedImage || defaultImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
                <button
                  onClick={toggleWish}
                  className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/90 rounded-full transition-all hover:scale-110 ${wishlisted.includes(product.productId) ? "text-red-500" : "text-muted-foreground"}`}
                >
                  <Heart size={18} fill={wishlisted.includes(product.productId) ? "currentColor" : "none"} />
                </button>
                
                {/* Navigation Arrows for Multiple Images */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {hasMultipleImages && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleThumbnailClick(img, idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-foreground font-heading mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description || "Crafted with love from 100% organic cotton muslin, luxuriously soft and breathable for ultimate comfort."}
              </p>

              {/* Color Selection with Horizontal Scroll */}
              {hasColors && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold">Select Color</h3>
                    {product.colors && product.colors.length > 6 && (
                      <p className="text-xs text-muted-foreground">
                        {product.colors.length} colors
                      </p>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div className="overflow-x-auto overflow-y-visible pb-3" style={{ scrollbarWidth: 'thin' }}>
                      <div className="flex gap-3 min-w-max">
                        {product.colors?.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => handleColorSelect(color)}
                            className="group flex flex-col items-center gap-1 transition-all flex-shrink-0"
                          >
                            <div
                              className={`w-14 h-14 rounded-full border-2 transition-all duration-200 ${
                                selectedColor?.name === color.name
                                  ? 'border-primary scale-110 shadow-lg'
                                  : 'border-gray-200 group-hover:border-primary group-hover:scale-105'
                              }`}
                              style={{ 
                                background: color.code.startsWith('linear') 
                                  ? color.code 
                                  : `radial-gradient(circle at 30% 30%, ${color.code}, ${color.code}CC)`
                              }}
                            >
                              {selectedColor?.name === color.name && (
                                <Check size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md" />
                              )}
                            </div>
                            <span className={`text-xs transition-all ${
                              selectedColor?.name === color.name 
                                ? 'text-primary font-medium' 
                                : 'text-muted-foreground group-hover:text-primary'
                            }`}>
                              {color.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {selectedColor && (
                    <div className="mt-3 flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full border border-gray-300" 
                        style={{ background: selectedColor.code }}
                      />
                      <p className="text-sm text-muted-foreground">
                        Selected: <span className="font-medium text-primary">{selectedColor.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Size Selection */}
              {hasSizes && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold">Select Size</h3>
                    {sizeError && <p className="text-xs text-red-500">{sizeError}</p>}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError('');
                        }}
                        className={`px-5 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {quantity} item{quantity > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 font-bold uppercase tracking-wider text-sm rounded-lg transition-all ${
                    added
                      ? "bg-green-600 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {added ? "Added! ✓" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-6 font-bold uppercase tracking-wider text-sm rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Buy It Now
                </button>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="border-t border-border pt-12 mb-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4">Product Details</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">Material:</strong> {product.material || '100% Organic Cotton Muslin'}</p>
                  <p><strong className="text-foreground">Care Instructions:</strong> {product.care || 'Machine wash cold, tumble dry low'}</p>
                  {hasSizes && (
                    <p><strong className="text-foreground">Available Sizes:</strong> {product.sizes?.join(', ')}</p>
                  )}
                  {hasColors && (
                    <p><strong className="text-foreground">Available Colors:</strong> {product.colors?.map(c => c.name).join(', ')}</p>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4">Why Choose Tiiny Berry?</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Purest softness - 100% organic cotton, gentle on skin</li>
                  <li>✓ Safety-first - label-free, saliva-tested for peace of mind</li>
                  <li>✓ Naturally breathable - keeps your baby cool and comfy all day</li>
                  <li>✓ Adorable designs - stylish and snuggly</li>
                  <li>✓ Eco-friendly choice - good for babies and our planet</li>
                </ul>
              </div>
            </div>
          </div>

          {/* You May Also Like */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-heading font-light mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((related) => (
                  <div
                    key={related.productId}
                    onClick={() => navigate(`/product/${related.productId}`)}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-muted" style={{ aspectRatio: "3/4" }}>
                      <img
                        src={related.image || defaultImage}
                        alt={related.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-medium text-foreground">{related.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-primary">Rs. {related.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default ProductDetails;