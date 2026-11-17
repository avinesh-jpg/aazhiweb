import express from 'express';
import Subcategory from '../models/Subcategory.js';

const router = express.Router();

const normalizeCategory = (cat) => {
  if (!cat) return cat;
  const lower = cat.trim().toLowerCase();
  if (lower === 'unisex') return 'Unisex';
  if (lower === 'girls') return 'Girls';
  if (lower === 'boys') return 'Boys';
  if (lower === 'newborn' || lower === 'new born') return 'newborn';
  if (lower === 'women' || lower === 'womens') return 'women';
  return cat.trim();
};

// Get all subcategories
router.get('/', async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .collation({ locale: 'en', strength: 2 })
      .sort({ category: 1, order: 1 });
    res.json({ success: true, subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get subcategories by category
router.get('/category/:category', async (req, res) => {
  try {
    const categoryParam = req.params.category;
    const categoryRegex = new RegExp(`^${categoryParam}$`, 'i');
    const subcategories = await Subcategory.find({ 
      category: { $regex: categoryRegex },
      isActive: true 
    }).sort({ order: 1 });
    res.json({ success: true, subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create subcategory
router.post('/', async (req, res) => {
  try {
    if (req.body.category) {
      req.body.category = normalizeCategory(req.body.category);
    }
    const subcategory = new Subcategory(req.body);
    await subcategory.save();
    res.json({ success: true, subcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update subcategory
router.put('/:id', async (req, res) => {
  try {
    if (req.body.category) {
      req.body.category = normalizeCategory(req.body.category);
    }
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, subcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete subcategory
router.delete('/:id', async (req, res) => {
  try {
    await Subcategory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get fallback subcategories by category
router.get('/subcategories/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { subcategories } = await import('../data/subcategories.js');
    const categorySubs = subcategories[category.toLowerCase()] || subcategories[category] || [];
    res.json({ success: true, subcategories: categorySubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;