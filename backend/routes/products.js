import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }
    
    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');
    
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex },
        { description: searchRegex }
      ]
    }).limit(20);
    
    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by age
router.get('/age/:age', async (req, res) => {
  try {
    const { age } = req.params;
    const products = await Product.find({ age });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by subcategory name
router.get('/subcategory/:subcategoryName', async (req, res) => {
  try {
    const { subcategoryName } = req.params;
    const decodedSubcategory = decodeURIComponent(subcategoryName);
    const products = await Product.find({ subcategory: decodedSubcategory });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================
// ✅ NEW: SLUG-BASED ROUTES
// =============================================

// Get product by slug only
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product by category + slug
router.get('/category/:category/slug/:slug', async (req, res) => {
  try {
    const { category, slug } = req.params;
    const product = await Product.findOne({ 
      category: category,
      slug 
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// routes/products.js - Add this route

// Get product by category + subcategory + slug (case-insensitive)
router.get('/category/:category/subcategory/:subcategory/slug/:slug', async (req, res) => {
  try {
    const { category, subcategory, slug } = req.params;
    
    const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');
    const decodedSubcategory = decodeURIComponent(subcategory).replace(/-/g, ' ');
    
    const product = await Product.findOne({ 
      category: { $regex: new RegExp(`^${decodedCategory}$`, 'i') },
      subcategory: { $regex: new RegExp(`^${decodedSubcategory}$`, 'i') },
      slug: slug
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ NEW: Generate slugs for existing products (Migration endpoint)
router.post('/generate-slugs', async (req, res) => {
  try {
    const products = await Product.find({ slug: { $exists: false } });
    let updated = 0;
    
    for (const product of products) {
      if (product.name) {
        let slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        const existing = await Product.findOne({ 
          slug: slug, 
          _id: { $ne: product._id } 
        });
        
        if (existing) {
          slug = `${slug}-${product.productId}`;
        }
        
        product.slug = slug;
        await product.save();
        updated++;
      }
    }
    
    res.json({ 
      message: `Slugs generated for ${updated} products`,
      totalProcessed: products.length,
      updated
    });
  } catch (error) {
    console.error('Error generating slugs:', error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================
// EXISTING: Get single product by ID
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let product;
    
    if (!isNaN(id)) {
      product = await Product.findOne({ productId: parseInt(id) });
    } else {
      product = await Product.findById(id);
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product by productId (alternative)
router.get('/product/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let product;
    
    if (!isNaN(id)) {
      product = await Product.findOne({ productId: parseInt(id) });
    } else {
      product = await Product.findById(id);
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get bestsellers
router.get('/bestsellers', async (req, res) => {
  try {
    const products = await Product.find({ badge: 'Bestseller' });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;