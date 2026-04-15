import React, { useState, useEffect, useCallback } from 'react';
import { CartContext } from './CartContext';
import { CartItem, CartContextType } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getSessionId = () => {
  let sessionId = localStorage.getItem('tiinyberry_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem('tiinyberry_session_id', sessionId);
  }
  return sessionId;
};

const getToken = () => {
  return localStorage.getItem('tiinyberry_token');
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionId = getSessionId();

  const getHeaders = useCallback(() => {
    const token = getToken();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['x-session-id'] = sessionId;
    }
    
    return headers;
  }, [sessionId]);

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch cart response:', data);
        const items = Array.isArray(data) ? data : (data.items || []);
        
        // Log each item's details including color
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items.forEach((item: any, index: number) => {
          console.log(`Cart item ${index + 1}:`, {
            name: item.name,
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity
          });
        });
        
        setCartItems(items);
        
        if (data.sessionId) {
          localStorage.setItem('tiinyberry_session_id', data.sessionId);
        }
      } else {
        console.error('Failed to fetch cart:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: number, quantity: number = 1, size: string = '', color: string = '', colorImage: string = '') => {
  setLoading(true);
  try {
    console.log('Adding to cart:', { productId, quantity, size, color, colorImage });
    
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        productId: Number(productId), 
        quantity: Number(quantity), 
        size: size || '', 
        color: color || '',
        colorImage: colorImage || ''
      })
    });
    
    const data = await response.json();
    console.log('Add to cart response:', data);
    
    if (response.ok) {
      await fetchCart();
      return true;
    } else {
      console.error('Add to cart error:', data);
      return false;
    }
  } catch (error) {
    console.error('Failed to add to cart:', error);
    return false;
  } finally {
    setLoading(false);
  }
};
  const updateQuantity = async (productId: number, quantity: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cart/update/${productId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity })
      });
      
      if (response.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update quantity:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (response.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (response.ok) {
        setCartItems([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const mergeGuestCart = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    const guestSessionId = localStorage.getItem('tiinyberry_session_id');
    if (!guestSessionId) return;
    
    try {
      const response = await fetch(`${API_URL}/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId: guestSessionId })
      });
      
      if (response.ok) {
        localStorage.removeItem('tiinyberry_session_id');
        await fetchCart();
        console.log('Guest cart merged successfully');
      }
    } catch (error) {
      console.error('Failed to merge cart:', error);
    }
  }, [fetchCart]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  console.log('Cart count:', cartCount);
  console.log('Cart items:', cartItems);

  const value: CartContextType = {
    cartItems,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCart,
    fetchCart,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};