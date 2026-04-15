import { useCart } from "@/context/useCart";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import BackToTop from "@/components/BackToTop";

// Update CartItem interface locally (if not exported from types)
interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  size?: string;  // Make size optional
  quantity: number;
}

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartCount, loading } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem('tiinyberry_token');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 3000 ? 0 : 100;
  const total = subtotal + shipping;

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId: number) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeFromCart(productId);
    }
  };

  const handleCheckout = () => {
    if (token) {
      navigate('/checkout');
    } else {
      // For guest users, show login modal or go to guest checkout
      window.dispatchEvent(new CustomEvent('showLoginModal', { 
        detail: { message: 'Login to save your order history, or continue as guest' } 
      }));
      // You can also navigate to guest checkout
      // navigate('/guest-checkout');
    }
  };

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
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Continue Shopping</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-heading font-light mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <ShoppingBag size={64} className="mx-auto text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="border-b border-border pb-3 mb-4 hidden md:grid md:grid-cols-12 text-sm font-semibold text-muted-foreground">
                  <div className="md:col-span-6">Product</div>
                  <div className="md:col-span-2 text-center">Price</div>
                  <div className="md:col-span-2 text-center">Quantity</div>
                  <div className="md:col-span-2 text-right">Total</div>
                </div>
                
                {cartItems.map((item, index) => (
                  <div 
                    key={`${item.productId}-${index}`}
                    className="border-b border-border py-6"
                  >
                    <div className="grid md:grid-cols-12 gap-4 items-center">
                      {/* Product Image & Name */}
                      <div className="md:col-span-6 flex gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{item.name}</h3>
                          {/* Add size display here */}
                          {item.size && item.size !== '' && (
                            <p className="text-sm text-muted-foreground mt-1">Size: {item.size}</p>
                          )}
                          <button
                            onClick={() => handleRemove(item.productId)}
                            className="text-red-500 text-sm hover:text-red-600 mt-2 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="md:col-span-2 text-center">
                        <span className="text-primary font-semibold">
                          Rs. {item.price.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-accent transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-accent transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="md:col-span-2 text-right">
                        <span className="font-semibold text-foreground">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-secondary/30 rounded-xl p-6 h-fit sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                    <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {shipping > 0 && subtotal < 3000 && (
                    <p className="text-xs text-muted-foreground">
                      Add Rs. {(3000 - subtotal).toLocaleString()} more for free shipping
                    </p>
                  )}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg text-primary">Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="w-full mt-3 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition-colors"
                >
                  Continue Shopping
                </button>
                
                {!token && (
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Guest checkout available. Login to save your order history.
                  </p>
                )}
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

export default Cart;