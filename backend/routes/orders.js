import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import ShippingSetting from '../models/ShippingSetting.js';
import StockLog from '../models/StockLog.js';
import { sendOrderConfirmation } from '../config/email.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tiinyberry_secret_key_2024';

// Lookup previous shipping address by email (or phone)
router.post('/lookup-customer', async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone required' });
    }

    let foundAddress = null;

    // 1. Check registered user profile first
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: cleanEmail });
      if (user && user.addresses && user.addresses.length > 0) {
        const def = user.addresses.find(a => a.isDefault) || user.addresses[user.addresses.length - 1];
        foundAddress = {
          fullName: def.fullName || user.name || '',
          email: user.email || cleanEmail,
          phone: def.phone || user.mobileNumber || user.phone || '',
          address: def.address || '',
          city: def.city || '',
          state: def.state || '',
          pincode: def.pincode || ''
        };
      }
    }

    // 2. Check previous orders (guest or registered) for this email or phone
    if (!foundAddress) {
      const query = [];
      if (email) {
        query.push({ 'shippingAddress.email': email.toLowerCase().trim() });
      }
      if (phone) {
        query.push({ 'shippingAddress.phone': phone.trim() });
      }

      const lastOrder = await Order.findOne({ $or: query })
        .sort({ createdAt: -1 });

      if (lastOrder && lastOrder.shippingAddress) {
        foundAddress = {
          fullName: lastOrder.shippingAddress.fullName || '',
          email: lastOrder.shippingAddress.email || email || '',
          phone: lastOrder.shippingAddress.phone || phone || '',
          address: lastOrder.shippingAddress.address || '',
          city: lastOrder.shippingAddress.city || '',
          state: lastOrder.shippingAddress.state || '',
          pincode: lastOrder.shippingAddress.pincode || ''
        };
      }
    }

    if (foundAddress && (foundAddress.address || foundAddress.fullName)) {
      return res.json({ success: true, address: foundAddress });
    }

    return res.json({ success: false, message: 'No previous address found' });
  } catch (error) {
    console.error('Lookup customer address error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

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
    
    // Verify real-time stock availability before allowing checkout
    for (const item of cart.items) {
      const productIdNum = !isNaN(Number(item.productId)) ? Number(item.productId) : null;
      const query = [];
      if (productIdNum) query.push({ productId: productIdNum });
      if (mongoose.Types.ObjectId.isValid(item.productId)) query.push({ _id: item.productId });

      const product = query.length > 0 ? await Product.findOne({ $or: query }) : null;

      if (!product || product.inStock === false) {
        return res.status(400).json({
          success: false,
          message: `"${item.name}" is out of stock. Please remove it from your cart to proceed.`
        });
      }

      if (product.sizes && product.sizes.length > 0 && item.size) {
        const itemSizeClean = (item.size || '').trim().toLowerCase();
        const sizeObj = product.sizes.find(s => (s.name || '').trim().toLowerCase() === itemSizeClean);

        if (sizeObj && sizeObj.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: sizeObj.stock === 0 
              ? `"${product.name}" in size ${sizeObj.name} is now out of stock.`
              : `Only ${sizeObj.stock} left in "${product.name}" (Size: ${sizeObj.name}). Please adjust the quantity in your cart.`
          });
        }
      }
    }
    
    // Calculate totals
    const rawSubtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate combo discount (e.g. Any 5 Sleeveless Shorts Sets for 999)
    const eligibleSleeveless = cart.items.filter(item => {
      const name = (item.name || '').toLowerCase();
      const sub = (item.subcategory || '').toLowerCase();
      return name.includes('sleevless') || name.includes('sleeveless') || sub.includes('sleeveless');
    });
    const totalEligibleQty = eligibleSleeveless.reduce((sum, item) => sum + item.quantity, 0);
    let comboDiscount = 0;
    if (totalEligibleQty >= 5) {
      const bundleCount = Math.floor(totalEligibleQty / 5);
      const remainderQty = totalEligibleQty % 5;
      const regularEligiblePrice = eligibleSleeveless.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const averageItemPrice = regularEligiblePrice / totalEligibleQty;
      const finalEligiblePrice = (bundleCount * 999) + (remainderQty * averageItemPrice);
      comboDiscount = Math.max(0, Math.round(regularEligiblePrice - finalEligiblePrice));
    }

    // Subtotal after combo discount
    const discountedSubtotal = Math.max(0, rawSubtotal - comboDiscount);
    
    // Fetch shipping rate dynamically from DB settings
    let shipping = 100;
    try {
      const settings = await ShippingSetting.findOne();
      if (settings) {
        shipping = discountedSubtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingRate;
      } else {
        shipping = discountedSubtotal >= 3000 ? 0 : 100;
      }
    } catch (e) {
      console.error('Error fetching shipping setting:', e);
      shipping = discountedSubtotal >= 3000 ? 0 : 100;
    }
    
    // Calculate coupon discount
    let discount = 0;
    let validatedCouponCode = null;
    if (couponCode) {
      const uppercaseCode = couponCode.toUpperCase().trim();
      const coupon = await Coupon.findOne({ code: uppercaseCode, isActive: true });
      if (coupon && discountedSubtotal >= coupon.threshold) {
        discount = coupon.discount;
        validatedCouponCode = coupon.code;
      }
    }
    
    const total = discountedSubtotal - discount + shipping;
    
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
      subtotal: rawSubtotal,
      comboDiscount,
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
    
    const wasAlreadyPaid = order.paymentStatus === 'paid';

    // Update order
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpayOrderId = razorpayOrderId;
    order.status = 'confirmed';
    await order.save();
    
    console.log(`✅ Order confirmed: ${order.orderNumber}`);

    // Deduct stock for all purchased items (only on first confirmation)
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

            let previousStock = 0;
            let newStock = 0;

            if (product.sizes && product.sizes.length > 0) {
              const itemSizeClean = (item.size || '').trim().toLowerCase();
              const sizeIndex = product.sizes.findIndex(s => (s.name || '').trim().toLowerCase() === itemSizeClean);

              if (sizeIndex !== -1) {
                previousStock = product.sizes[sizeIndex].stock || 0;
                newStock = Math.max(0, previousStock - (item.quantity || 1));
                product.sizes[sizeIndex].stock = newStock;
                stockChanged = true;
              } else if (product.sizes.length === 1 && product.sizes[0].name === 'One Size') {
                previousStock = product.sizes[0].stock || 0;
                newStock = Math.max(0, previousStock - (item.quantity || 1));
                product.sizes[0].stock = newStock;
                stockChanged = true;
              }

              // Check if all sizes are now 0 stock
              const totalRemaining = product.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
              if (totalRemaining === 0) {
                product.inStock = false;
                stockChanged = true;
              }
            } else if (typeof product.stockQuantity === 'number') {
              previousStock = product.stockQuantity;
              newStock = Math.max(0, product.stockQuantity - (item.quantity || 1));
              product.stockQuantity = newStock;
              if (product.stockQuantity === 0) {
                product.inStock = false;
              }
              stockChanged = true;
            }

            if (stockChanged) {
              await product.save();
              console.log(`📉 Decremented stock for ${product.name} (Size: ${item.size || 'N/A'}, Qty: ${item.quantity})`);
              try {
                await StockLog.create({
                  productId: String(product.productId || product._id),
                  productName: product.name,
                  size: item.size || 'N/A',
                  change: -(item.quantity || 1),
                  previousStock,
                  newStock,
                  reason: 'order',
                  orderNumber: order.orderNumber,
                  note: `Purchased by ${order.shippingAddress?.fullName || 'Customer'}`
                });
              } catch (logErr) {
                console.error('Error logging stock deduction:', logErr);
              }
            }
          }
        } catch (stockErr) {
          console.error(`Error decrementing stock for item ${item.name}:`, stockErr);
        }
      }
      order.stockDeducted = true;
      await order.save();
    }
    
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