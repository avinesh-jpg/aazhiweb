import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// Helper to seed default coupon tiers if empty
const seedDefaults = async () => {
  const count = await Coupon.countDocuments();
  if (count === 0) {
    const defaultCoupons = [
      { code: 'LAUNCH100', threshold: 2000, discount: 100 },
      { code: 'LAUNCH200', threshold: 3000, discount: 200 }
    ];
    await Coupon.create(defaultCoupons);
    console.log('Seeded default coupon tiers.');
  }
};

// Get coupon tiers
router.get('/tiers', async (req, res) => {
  try {
    await seedDefaults();
    const coupons = await Coupon.find({ isActive: true }).sort({ threshold: 1 });
    res.json({ success: true, tiers: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Validate coupon code
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    if (subtotal === undefined || typeof subtotal !== 'number') {
      return res.status(400).json({ success: false, message: 'Valid subtotal is required' });
    }

    const uppercaseCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: uppercaseCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (subtotal < coupon.threshold) {
      return res.status(400).json({ 
        success: false, 
        message: `Min. spend of Rs. ${coupon.threshold.toLocaleString()} required for this coupon` 
      });
    }

    res.json({
      success: true,
      discount: coupon.discount,
      code: coupon.code,
      threshold: coupon.threshold
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
