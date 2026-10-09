import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    console.log('Creating Razorpay order:', { amount, receipt });
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: currency,
      receipt: receipt,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    
    console.log('Razorpay order created:', order.id);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify Payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;
    
    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, orderId });
    
    if (!orderId || orderId === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (isAuthentic) {
      // Update order status
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      const wasAlreadyPaid = order.paymentStatus === 'paid';

      order.paymentStatus = 'paid';
      order.razorpayOrderId = razorpay_order_id;
      order.razorpayPaymentId = razorpay_payment_id;
      order.status = 'confirmed';
      order.paymentMethod = 'razorpay';
      await order.save();
      
      // Deduct stock for all purchased items (only on first verification)
      if (!order.stockDeducted && !wasAlreadyPaid && order.items && order.items.length > 0) {
        for (const item of order.items) {
          try {
            const productIdNum = !isNaN(Number(item.productId)) ? Number(item.productId) : null;
            const query = [];
            if (productIdNum) query.push({ productId: productIdNum });
            if (mongoose.Types.ObjectId.isValid(item.productId)) query.push({ _id: item.productId });

            const product = query.length > 0 ? await Product.findOne({ $or: query }) : null;

            if (product) {
              let stockChanged = false;

              if (product.sizes && product.sizes.length > 0) {
                const itemSizeClean = (item.size || '').trim().toLowerCase();
                const sizeIndex = product.sizes.findIndex(s => (s.name || '').trim().toLowerCase() === itemSizeClean);

                if (sizeIndex !== -1) {
                  const currentStock = product.sizes[sizeIndex].stock || 0;
                  product.sizes[sizeIndex].stock = Math.max(0, currentStock - (item.quantity || 1));
                  stockChanged = true;
                } else if (product.sizes.length === 1 && product.sizes[0].name === 'One Size') {
                  const currentStock = product.sizes[0].stock || 0;
                  product.sizes[0].stock = Math.max(0, currentStock - (item.quantity || 1));
                  stockChanged = true;
                }

                // Check if all sizes are now 0 stock
                const totalRemaining = product.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
                if (totalRemaining === 0) {
                  product.inStock = false;
                  stockChanged = true;
                }
              } else if (typeof product.stockQuantity === 'number') {
                product.stockQuantity = Math.max(0, product.stockQuantity - (item.quantity || 1));
                if (product.stockQuantity === 0) {
                  product.inStock = false;
                }
                stockChanged = true;
              }

              if (stockChanged) {
                await product.save();
                console.log(`📉 Decremented stock for ${product.name} (Size: ${item.size || 'N/A'}, Qty: ${item.quantity})`);
              }
            }
          } catch (stockErr) {
            console.error(`Error decrementing stock for item ${item.name}:`, stockErr);
          }
        }
        order.stockDeducted = true;
        await order.save();
      }

      // Clear cart after successful payment
      if (order.userId) {
        await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
      } else if (order.sessionId) {
        await Cart.findOneAndUpdate({ sessionId: order.sessionId }, { items: [] });
      }
      
      console.log(`✅ Payment verified for order: ${order.orderNumber}`);
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status
        }
      });
    } else {
      console.error('Payment signature mismatch');
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get payment status
router.get('/payment-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId || orderId === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      razorpayPaymentId: order.razorpayPaymentId
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;