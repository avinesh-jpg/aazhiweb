import express from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import ShippingSetting from '../models/ShippingSetting.js';
import { sendOrderConfirmation } from '../config/email.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tiinyberry_secret_key_2024';

// Create pending order
router.post('/create-pending', async (req, res) => {
  try {
    const { shippingAddress, couponCode } = req.body;
    
    console.log('Creating pending order for email:', shippingAddress?.email);
    
    // Validate required fields
    if (!shippingAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Shipping address required' 
      });
    }
    
    if (!shippingAddress.fullName || !shippingAddress.email || !shippingAddress.phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and phone are required' 
      });
    }
    
    const customerEmail = shippingAddress.email.toLowerCase().trim();
    
    // Get cart - works for both logged-in and guest users
    let userId = null;
    let sessionId = null;
    let cart = null;
    
    // Check for logged-in user token
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
        cart = await Cart.findOne({ userId });
        console.log('Found cart for logged-in user:', userId);
      } catch(e) {
        console.log('Invalid token, checking guest session');
      }
    }
    
    // If not logged in, check guest session
    if (!cart) {
      sessionId = req.headers['x-session-id'];
      if (sessionId) {
        cart = await Cart.findOne({ sessionId });
        console.log('Found cart for guest session:', sessionId);
      }
    }
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }
    
    console.log('Cart items count:', cart.items.length);
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Fetch shipping rate dynamically from DB settings
    let shipping = 100;
    try {
      const settings = await ShippingSetting.findOne();
      if (settings) {
        shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingRate;
      } else {
        shipping = subtotal >= 3000 ? 0 : 100;
      }
    } catch (e) {
      console.error('Error fetching shipping setting:', e);
      shipping = subtotal >= 3000 ? 0 : 100;
    }
    
    // Calculate coupon discount
    let discount = 0;
    let validatedCouponCode = null;
    if (couponCode) {
      const uppercaseCode = couponCode.toUpperCase().trim();
      const coupon = await Coupon.findOne({ code: uppercaseCode, isActive: true });
      if (coupon && subtotal >= coupon.threshold) {
        discount = coupon.discount;
        validatedCouponCode = coupon.code;
      }
    }
    
    const total = subtotal - discount + shipping;
    
    // Create order
    const order = new Order({
      userId: userId || null,
      sessionId: !userId ? sessionId : null,
      guestEmail: customerEmail,
      guestName: shippingAddress.fullName,
      guestMobile: shippingAddress.phone,
      items: cart.items.map(item => ({
        productId: String(item.productId),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
        image: item.image
      })),
      subtotal,
      shipping,
      discount,
      couponCode: validatedCouponCode,
      total,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      status: 'pending',
      shippingAddress: {
        fullName: shippingAddress.fullName,
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode || '',
        phone: shippingAddress.phone,
        email: customerEmail
      }
    });
    
    await order.save();
    console.log(`✅ Pending order created: ${order.orderNumber}`);
    
    // Find or create user
    let user = await User.findOne({ email: customerEmail });
    
    if (!user) {
      // Create new user
      const nameFromEmail = customerEmail.split('@')[0];
      user = new User({
        name: shippingAddress.fullName || nameFromEmail,
        email: customerEmail,
        mobileNumber: shippingAddress.phone,
        phone: shippingAddress.phone,
        addresses: [{
          fullName: shippingAddress.fullName,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          phone: shippingAddress.phone,
          email: customerEmail,
          isDefault: true
        }]
      });
      await user.save();
      console.log(`✅ Created new user for email: ${customerEmail} with address`);
    } else {
      // Update existing user profile with order address if not already saved
      let addressUpdated = false;
      
      // Check if this address already exists
      const addressExists = user.addresses.some(addr => 
        addr.address === shippingAddress.address && 
        addr.city === shippingAddress.city &&
        addr.pincode === shippingAddress.pincode
      );
      
      if (!addressExists && shippingAddress.address) {
        user.addresses.push({
          fullName: shippingAddress.fullName,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          phone: shippingAddress.phone,
          email: customerEmail,
          isDefault: user.addresses.length === 0
        });
        addressUpdated = true;
        console.log(`✅ Added new address to user profile: ${shippingAddress.address}`);
      }
      
      // Update user name if it's still the default
      if (user.name === customerEmail.split('@')[0] && shippingAddress.fullName) {
        user.name = shippingAddress.fullName;
        addressUpdated = true;
      }
      
      // Update phone if not set
      if (!user.phone && shippingAddress.phone) {
        user.phone = shippingAddress.phone;
        addressUpdated = true;
      }
      
      if (addressUpdated) {
        await user.save();
      }
    }
    
    // Link order to user
    order.userId = user._id;
    await order.save();
    
    res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: total,
      email: customerEmail,
      isGuest: !userId
    });
    
  } catch (error) {
    console.error('Create pending order error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
});

// Confirm order after payment
router.post('/confirm', async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId } = req.body;
    
    console.log('Confirming order:', { orderId });
    
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID required' 
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Update order
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpayOrderId = razorpayOrderId;
    order.status = 'confirmed';
    await order.save();
    
    console.log(`✅ Order confirmed: ${order.orderNumber}`);
    
    // Clear cart
    if (order.userId) {
      await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
    } else if (order.sessionId) {
      await Cart.findOneAndUpdate({ sessionId: order.sessionId }, { items: [] });
    }
    
    // Send email confirmation
    try {
      await sendOrderConfirmation(order, order.shippingAddress.email, order.shippingAddress.fullName);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Order confirmed',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status
      }
    });
    
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user orders
router.get('/my-orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const orders = await Order.find({
      $or: [
        { userId: userId },
        { guestEmail: user.email },
        { 'shippingAddress.email': user.email }
      ]
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for ${user.email}`);
    
    res.json({ success: true, orders });
    
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;  