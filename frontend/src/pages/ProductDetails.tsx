import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Minus, Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
  colors?: Color[];
  category: string;
  age?: string;
  description?: string;
  sizes?: Size[];
  material?: string;
  care?: string;
  inStock?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
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
          
          if (data.sizes && data.sizes.length > 0) {
            if (data.sizes[0].name === 'One Size') {
              setSelectedSize(data.sizes[0]);
            } else {
              setSelectedSize(data.sizes[0]);
            }
          }
          
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0]);
            if (data.colors[0].images && data.colors[0].images.length > 0) {
              setSelectedImage(data.colors[0].images[0]);
            }
          } else {
            setSelectedImage(data.image);
          }
          
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
        toast.success('Removed from wishlist');
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
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error('Something went wrong');
    }
  };

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
    if (color.images && color.images.length > 0) {
      setSelectedImage(color.images[0]);
      setCurrentImageIndex(0);
    }
  };

  const getStockStatus = () => {
    if (!product) return { text: "Loading...", color: "text-gray-600", bg: "bg-gray-100", badge: "bg-gray-100 text-gray-800" };
    
    if (product.sizes && product.sizes.length > 0 && product.sizes[0].name !== 'One Size') {
      if (!selectedSize) {
        return { text: "Select a size", color: "text-yellow-600", bg: "bg-yellow-100", badge: "bg-yellow-100 text-yellow-800" };
      }
      if (selectedSize.stock === 0) {
        return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-100", badge: "bg-red-100 text-red-800" };
      }
      if (selectedSize.stock <= 3) {
        return { text: `⚠️ Only ${selectedSize.stock} left in ${selectedSize.name}`, color: "text-orange-600", bg: "bg-orange-100", badge: "bg-orange-100 text-orange-800 animate-pulse" };
      }
      if (selectedSize.stock <= 3) {
        return { text: `📦 Only ${selectedSize.stock} left`, color: "text-yellow-600", bg: "bg-yellow-100", badge: "bg-yellow-100 text-yellow-800" };
      }
      return { text: "✓ In Stock", color: "text-green-600", bg: "bg-green-100", badge: "bg-green-100 text-green-800" };
    }
    
    if (product.sizes && product.sizes.length > 0 && product.sizes[0].name === 'One Size') {
      const oneSize = product.sizes[0];
      if (oneSize.stock === 0) {
        return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-100", badge: "bg-red-100 text-red-800" };
      }
      if (oneSize.stock <= 5) {
        return { text: `⚠️ Only ${oneSize.stock} left in stock`, color: "text-orange-600", bg: "bg-orange-100", badge: "bg-orange-100 text-orange-800 animate-pulse" };
      }
      if (oneSize.stock <= 10) {
        return { text: `📦 Only ${oneSize.stock} left`, color: "text-yellow-600", bg: "bg-yellow-100", badge: "bg-yellow-100 text-yellow-800" };
      }
      return { text: "✓ In Stock", color: "text-green-600", bg: "bg-green-100", badge: "bg-green-100 text-green-800" };
    }
    
    return { text: "✓ In Stock", color: "text-green-600", bg: "bg-green-100", badge: "bg-green-100 text-green-800" };
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const hasSizes = product.sizes && product.sizes.length > 0 && product.sizes[0].name !== 'One Size';
    
    if (hasSizes) {
      if (!selectedSize) {
        setSizeError('Please select a size');
        toast.error('Please select a size');
        return;
      }
      
      if (selectedSize.stock === 0) {
        toast.error(`${selectedSize.name} size is out of stock!`);
        return;
      }
      
      if (quantity > selectedSize.stock) {
        toast.error(`Only ${selectedSize.stock} items available in ${selectedSize.name} size!`);
        return;
      }
    } else if (product.sizes && product.sizes.length > 0 && product.sizes[0].name === 'One Size') {
      const oneSize = product.sizes[0];
      if (oneSize.stock === 0) {
        toast.error('This product is out of stock!');
        return;
      }
      if (quantity > oneSize.stock) {
        toast.error(`Only ${oneSize.stock} items available in stock!`);
        return;
      }
    }
    
    setSizeError('');
    const colorName = selectedColor?.name || '';
    const colorImage = selectedColor?.images?.[0] || product.image;
    const sizeName = selectedSize?.name || (product.sizes && product.sizes[0]?.name === 'One Size' ? 'One Size' : '');
    
    const success = await addToCart(product.productId, quantity, sizeName, colorName, colorImage);
    
    if (success) {
      setAdded(true);
      toast.success(`Added ${quantity} item(s) to cart!`);
      setTimeout(() => setAdded(false), 2000);
    } else {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    const hasSizes = product.sizes && product.sizes.length > 0 && product.sizes[0].name !== 'One Size';
    
    if (hasSizes) {
      if (!selectedSize) {
        setSizeError('Please select a size');
        toast.error('Please select a size');
        return;
      }
      
      if (selectedSize.stock === 0) {
        toast.error(`${selectedSize.name} size is out of stock!`);
        return;
      }
    } else if (product.sizes && product.sizes.length > 0 && product.sizes[0].name === 'One Size') {
      if (product.sizes[0].stock === 0) {
        toast.error('This product is out of stock!');
        return;
      }
    }
    
    await handleAddToCart();
    navigate('/cart');
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (!product) return;
    
    let maxStock = Infinity;
    const hasSizes = product.sizes && product.sizes.length > 0 && product.sizes[0].name !== 'One Size';
    
    if (hasSizes && selectedSize) {
      maxStock = selectedSize.stock;
    } else if (product.sizes && product.sizes.length > 0 && product.sizes[0].name === 'One Size') {
      maxStock = product.sizes[0].stock;
    }
    
    if (type === 'increase') {
      if (quantity >= maxStock) {
        toast.error(`Only ${maxStock} items available`);
        return;
      }
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
  const stockStatus = getStockStatus();
  
  const hasSizes = product?.sizes && product.sizes.length > 0 && product.sizes[0].name !== 'One Size';
  
  const isOutOfStock = () => {
    if (!product) return true;
    const hasSizes = product.sizes && product.sizes.length > 0 && product.sizes[0].name !== 'One Size';
    
    if (hasSizes) {
      if (!selectedSize) return false;
      return selectedSize.stock === 0;
    } else if (product.sizes && product.sizes.length > 0 && product.sizes[0].name === 'One Size') {
      return product.sizes[0].stock === 0;
    }
    return false;
  };
  
  const outOfStock = isOutOfStock();

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

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5efff] via-[#e8f0fe] to-[#faf5ff]">
        <AnnouncementBar />
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-heading bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Product not found
          </h2>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 text-purple-500 hover:text-purple-600 hover:underline transition-all"
          >
            Back to Home
          </button>
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
          <div className="mb-6 text-sm text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-purple-500 transition-colors">Home</button>
            <span className="mx-2">/</span>
            <button onClick={() => navigate(`/category/collection/${product.category}`)} className="hover:text-purple-500 transition-colors">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </button>
            <span className="mx-2">/</span>
            <span className="text-[#1e1b4b]">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-purple-50/30 shadow-lg" style={{ aspectRatio: "3/4" }}>
                <img 
                  src={selectedImage || defaultImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                
                {product.badge && !outOfStock && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    {product.badge}
                  </span>
                )}
                
                {outOfStock && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-bold text-lg uppercase tracking-wider px-6 py-3 bg-red-600 rounded-full rotate-12 shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
                
                {!outOfStock && (
                  <button
                    onClick={toggleWish}
                    className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full transition-all hover:scale-110 ${
                      wishlisted.includes(product.productId) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart size={18} fill={wishlisted.includes(product.productId) ? "currentColor" : "none"} />
                  </button>
                )}
                
                {hasMultipleImages && !outOfStock && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md"
                    >
                      <ChevronLeft size={20} className="text-purple-600" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md"
                    >
                      <ChevronRight size={20} className="text-purple-600" />
                    </button>
                  </>
                )}
              </div>

              {hasMultipleImages && !outOfStock && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleThumbnailClick(img, idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img ? 'border-purple-500 shadow-md' : 'border-transparent hover:border-purple-300'
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

            <div>
              <h1 className="text-3xl md:text-4xl font-light font-heading mb-3 bg-gradient-to-r from-[#1e1b4b] to-[#5b21b6] bg-clip-text text-transparent">
                {product.name}
              </h1>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${stockStatus.badge} mb-4`}>
                <span className={`text-sm font-medium ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-2xl font-bold ${outOfStock ? 'text-gray-400' : 'bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'}`}>
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description || "Crafted with love from 100% organic cotton muslin, luxuriously soft and breathable for ultimate comfort."}
              </p>

              {hasColors && !outOfStock && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-[#1e1b4b]">Select Color</h3>
                    {product.colors && product.colors.length > 6 && (
                      <p className="text-xs text-gray-500">
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
                                  ? 'border-purple-500 scale-110 shadow-lg'
                                  : 'border-gray-200 group-hover:border-purple-400 group-hover:scale-105'
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
                                ? 'text-purple-600 font-medium' 
                                : 'text-gray-500 group-hover:text-purple-500'
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
                      <p className="text-sm text-gray-500">
                        Selected: <span className="font-medium text-purple-600">{selectedColor.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {hasSizes && !outOfStock && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-[#1e1b4b]">Select Size</h3>
                    {sizeError && <p className="text-xs text-red-500">{sizeError}</p>}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes?.map((sizeObj: Size) => (
                      <button
                        key={sizeObj.name}
                        onClick={() => {
                          setSelectedSize(sizeObj);
                          setSizeError('');
                          setQuantity(1);
                        }}
                        disabled={sizeObj.stock === 0}
                        className={`px-5 py-2.5 border rounded-full text-sm font-medium transition-all relative ${
                          selectedSize?.name === sizeObj.name
                            ? "border-purple-500 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                            : sizeObj.stock === 0
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                            : "border-purple-200 hover:border-purple-400 text-[#1e1b4b] hover:bg-purple-50"
                        }`}
                      >
                        {sizeObj.name}
                        {sizeObj.stock > 0 && sizeObj.stock <= 3 && (
                          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                            Only {sizeObj.stock}
                          </span>
                        )}
                        {sizeObj.stock === 0 && (
                          <span className="ml-1 text-xs">(Out)</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedSize && selectedSize.stock > 0 && selectedSize.stock <= 3 && (
                    <p className="text-orange-600 text-sm mt-2">
                      ⚠️ Hurry! Only {selectedSize.stock} left in {selectedSize.name} size
                    </p>
                  )}
                </div>
              )}

              {!outOfStock && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-[#1e1b4b] mb-3">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-purple-200 rounded-full bg-white/50">
                      <button
                        onClick={() => handleQuantityChange('decrease')}
                        className="w-10 h-10 flex items-center justify-center rounded-l-full hover:bg-purple-100 transition-colors text-purple-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium text-[#1e1b4b]">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange('increase')}
                        className="w-10 h-10 flex items-center justify-center rounded-r-full hover:bg-purple-100 transition-colors text-purple-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {quantity} item{quantity > 1 ? 's' : ''}
                    </span>
                    {selectedSize && selectedSize.stock <= 3 && selectedSize.stock > 0 && (
                      <span className="text-xs text-orange-600 animate-pulse">
                        Only {selectedSize.stock} left in this size!
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {outOfStock ? (
                  <button
                    disabled
                    className="flex-1 py-3 px-6 font-bold uppercase tracking-wider text-sm rounded-full bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 py-3 px-6 font-bold uppercase tracking-wider text-sm rounded-full transition-all duration-300 ${
                        added
                          ? "bg-green-500 text-white shadow-md"
                          : "bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400 text-white hover:scale-105 hover:-translate-y-0.5 hover:shadow-purple-300/30"
                      }`}
                    >
                      {added ? "Added! ✓" : "Add to Cart"}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-3 px-6 font-bold uppercase tracking-wider text-sm rounded-full border-2 border-purple-400 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-400 hover:text-white hover:border-transparent transition-all duration-300"
                    >
                      Buy It Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-purple-100 pt-12 mb-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4 text-[#1e1b4b]">Product Details</h2>
                <div className="space-y-3 text-gray-600">
                  <p><strong className="text-[#1e1b4b]">Material:</strong> {product.material || '100% Organic Cotton Muslin'}</p>
                  <p><strong className="text-[#1e1b4b]">Care Instructions:</strong> {product.care || 'Machine wash cold, tumble dry low'}</p>
                  {hasSizes && (
                    <p>
                      <strong className="text-[#1e1b4b]">Available Sizes:</strong>{' '}
                      {product.sizes?.map(s => `${s.name} (${s.stock} left)`).join(', ')}
                    </p>
                  )}
                  {hasColors && (
                    <p><strong className="text-[#1e1b4b]">Available Colors:</strong> {product.colors?.map(c => c.name).join(', ')}</p>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4 text-[#1e1b4b]">Why Choose Aazhi?</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">✓ Purest softness - 100% organic cotton, gentle on skin</li>
                  <li className="flex items-center gap-2">✓ Safety-first - label-free, saliva-tested for peace of mind</li>
                  <li className="flex items-center gap-2">✓ Naturally breathable - keeps your baby cool and comfy all day</li>
                  <li className="flex items-center gap-2">✓ Adorable designs - stylish and snuggly</li>
                  <li className="flex items-center gap-2">✓ Eco-friendly choice - good for babies and our planet</li>
                </ul>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-heading font-light mb-6 bg-gradient-to-r from-[#1e1b4b] to-[#5b21b6] bg-clip-text text-transparent">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((related) => {
                  const relatedOutOfStock = related.sizes && related.sizes.length > 0 && related.sizes[0].stock === 0;
                  return (
                    <div
                      key={related.productId}
                      onClick={() => navigate(`/product/${related.productId}`)}
                      className="group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden rounded-xl bg-purple-50/30 shadow-md" style={{ aspectRatio: "3/4" }}>
                        <img
                          src={related.image || defaultImage}
                          alt={related.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {relatedOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xs font-bold px-2 py-1 bg-red-600 rounded-full">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <h3 className="text-sm font-medium text-[#1e1b4b] group-hover:text-purple-600 transition-colors">
                          {related.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            Rs. {related.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
