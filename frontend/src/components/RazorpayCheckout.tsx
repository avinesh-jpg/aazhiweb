import { useState } from 'react';

interface RazorpayCheckoutProps {
  amount: number;
  onCreateOrder: () => Promise<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (response: any, orderId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFailure: (error: any) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RazorpayCheckout = ({ amount, onCreateOrder, onSuccess, onFailure }: RazorpayCheckoutProps) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Failed to load payment gateway. Please refresh and try again.');
        setLoading(false);
        return;
      }
      
      // Create pending order first
      const orderId = await onCreateOrder();
      console.log('Pending order created:', orderId);
      
      // Create Razorpay order
      const orderResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          receipt: `order_${orderId}`
        })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }
      
      // Get user info for prefill
      const user = JSON.parse(localStorage.getItem('tiinyberry_user') || '{}');
      
      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Aazhi',
        description: 'Baby & Toddler Clothing',
        image: '/logo.png',
        order_id: orderData.order_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          console.log('Payment handler response:', response);
          onSuccess(response, orderId);
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.mobileNumber || ''
        },
        theme: {
          color: '#2c3e50'
        },
        modal: {
          ondismiss: () => {
            console.log('Checkout closed');
            setLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      onFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Pay ₹${amount.toLocaleString()}`}
    </button>
  );
};

export default RazorpayCheckout;