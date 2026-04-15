export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  colorImage: string;
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (productId: number, quantity?: number, size?: string, color?: string, colorImage?: string) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  mergeGuestCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  loading: boolean;
}