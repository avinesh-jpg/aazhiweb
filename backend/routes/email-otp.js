import express from 'express';
import jwt from 'jsonwebtoken';
import EmailOTP from '../models/EmailOTP.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { sendOTPEmail } from '../config/email.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tiinyberry_secret_key_2024';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ========== SEND OTP TO EMAIL ==========
router.post('/send-otp', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }
    
    const cleanEmail = email.toLowerCase().trim();
    console.log(`📧 OTP request for email: ${cleanEmail}`);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }
    
    // Check if user exists - create if not
    let user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      const nameFromEmail = cleanEmail.split('@')[0];
      user = new User({
        name: nameFromEmail,
        email: cleanEmail,
        isVerified: false
      });
      await user.save();
      console.log(`✅ Created new user for email: ${cleanEmail}`);
    } else {
      console.log(`✅ Existing user found for email: ${cleanEmail}`);
    }
    
    // Delete existing OTPs for this email
    await EmailOTP.deleteMany({ email: cleanEmail });
    
    // Generate new OTP
    const otp = generateOTP();
    
    // Save to database
    const newOTP = new EmailOTP({
      email: cleanEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await newOTP.save();
    
    console.log(`💾 OTP saved for ${cleanEmail}: ${otp}`);
    
    // Send OTP via email

    /*const emailSent = await sendOTPEmail(cleanEmail, otp, user.name);

res.json({
  success: true,
  message: emailSent ? 'OTP sent to your email' : 'OTP generated (check console)',
  email: cleanEmail,
  expiresIn: 600
});*/

    // Fire and forget — don't block the response on SMTP
sendOTPEmail(cleanEmail, otp, user.name).catch(err =>
  console.error('OTP email send failed:', err.message)
);

res.json({
  success: true,
  message: 'OTP sent to your email',
  email: cleanEmail,
  expiresIn: 600
});

    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========== VERIFY OTP AND LOGIN ==========
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    const cleanEmail = email.toLowerCase().trim();
    console.log(`🔐 Verifying OTP for: ${cleanEmail}`);
    
    // Find valid OTP in database
    const otpRecord = await EmailOTP.findOne({
      email: cleanEmail,
      otp,
      expiresAt: { $gt: new Date() },
      isVerified: false
    });
    
    if (!otpRecord) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    
    // Mark as verified and delete
    otpRecord.isVerified = true;
    await otpRecord.save();
    await EmailOTP.deleteOne({ _id: otpRecord._id });
    
    // Find user
    let user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      const nameFromEmail = cleanEmail.split('@')[0];
      user = new User({
        name: nameFromEmail,
        email: cleanEmail,
        isVerified: true
      });
      await user.save();
      console.log(`✅ Created new user for email: ${cleanEmail}`);
    } else {
      user.isVerified = true;
      await user.save();
    }
    
    // Find all orders for this email
    const orders = await Order.find({ 
      $or: [
        { userId: user._id },
        { guestEmail: cleanEmail },
        { 'shippingAddress.email': cleanEmail }
      ]
    }).sort({ createdAt: -1 });
    
    console.log(`✅ User logged in: ${user.email} - ${orders.length} orders`);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      },
      orders: orders
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== RESEND OTP ==========
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }
    
    const cleanEmail = email.toLowerCase().trim();
    
    // Find existing user
    let user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      const nameFromEmail = cleanEmail.split('@')[0];
      user = new User({
        name: nameFromEmail,
        email: cleanEmail,
        isVerified: false
      });
      await user.save();
    }
    
    // Delete existing OTPs
    await EmailOTP.deleteMany({ email: cleanEmail });
    
    // Generate new OTP
    const otp = generateOTP();
    
    // Save to database
    const newOTP = new EmailOTP({
      email: cleanEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await newOTP.save();
    
    // Send OTP via email
    const emailSent = await sendOTPEmail(cleanEmail, otp, user.name);
    
    res.json({
      success: true,
      message: emailSent ? 'OTP resent to your email' : 'OTP generated (check console)',
      expiresIn: 600
    });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
