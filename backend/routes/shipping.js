import express from 'express';
import ShippingSetting from '../models/ShippingSetting.js';
import { authAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to check if state is Tamil Nadu
const isTamilNaduState = (state) => {
  if (!state) return false;
  const cleaned = String(state).toLowerCase().replace(/[^a-z]/g, '');
  return cleaned === 'tamilnadu' || cleaned === 'tn';
};

// Get shipping settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await ShippingSetting.findOne();
    if (!settings) {
      // Create default settings
      settings = await ShippingSetting.create({
        freeShippingThreshold: 3000,
        tamilNaduShippingRate: 70,
        otherStatesShippingRate: 80,
        standardShippingRate: 70,
        expressShippingRate: 200,
        internationalShippingRate: 500
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update shipping settings (admin only)
router.put('/settings', authAdmin, async (req, res) => {
  try {
    const { 
      freeShippingThreshold, 
      tamilNaduShippingRate, 
      otherStatesShippingRate, 
      standardShippingRate, 
      expressShippingRate, 
      internationalShippingRate 
    } = req.body;
    
    let settings = await ShippingSetting.findOne();
    if (!settings) {
      settings = new ShippingSetting();
    }
    
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (tamilNaduShippingRate !== undefined) settings.tamilNaduShippingRate = Number(tamilNaduShippingRate);
    if (otherStatesShippingRate !== undefined) settings.otherStatesShippingRate = Number(otherStatesShippingRate);
    if (standardShippingRate !== undefined) settings.standardShippingRate = Number(standardShippingRate);
    if (expressShippingRate !== undefined) settings.expressShippingRate = Number(expressShippingRate);
    if (internationalShippingRate !== undefined) settings.internationalShippingRate = Number(internationalShippingRate);
    settings.updatedAt = Date.now();
    
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate shipping cost
router.post('/calculate', async (req, res) => {
  try {
    const { subtotal, shippingMethod = 'standard', state = '' } = req.body;
    const settings = await ShippingSetting.findOne();
    
    const tnRate = settings?.tamilNaduShippingRate ?? 70;
    const otherRate = settings?.otherStatesShippingRate ?? 80;
    const freeThreshold = settings?.freeShippingThreshold ?? 3000;
    
    const isTN = isTamilNaduState(state);
    const applicableStandardRate = isTN ? tnRate : (state ? otherRate : tnRate);

    if (!settings) {
      const isFree = subtotal >= freeThreshold;
      return res.json({ 
        success: true,
        shippingCost: isFree ? 0 : applicableStandardRate, 
        isFree,
        isTamilNadu: isTN,
        rateRegion: isTN ? 'Tamil Nadu' : (state ? 'Other States' : 'Tamil Nadu')
      });
    }
    
    let shippingCost = 0;
    let isFree = false;
    
    if (subtotal >= freeThreshold) {
      isFree = true;
      shippingCost = 0;
    } else {
      switch (shippingMethod) {
        case 'standard':
          shippingCost = applicableStandardRate;
          break;
        case 'express':
          shippingCost = settings.expressShippingRate || 200;
          break;
        case 'international':
          shippingCost = settings.internationalShippingRate || 500;
          break;
        default:
          shippingCost = applicableStandardRate;
      }
    }
    
    res.json({ 
      success: true, 
      shippingCost, 
      isFree,
      isTamilNadu: isTN,
      rateRegion: isTN ? 'Tamil Nadu' : (state ? 'Other States' : 'Tamil Nadu'),
      freeShippingThreshold: freeThreshold,
      remainingForFree: Math.max(0, freeThreshold - subtotal)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;