// routes/products.js
import express from 'express';
import Product from '../models/Product.js';
import { seoMiddleware } from '../middleware/seoMiddleware.js';

const router = express.Router();

// Apply SEO middleware to all routes
router.use(seoMiddleware);

// Get all products with SEO
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null
    }));
    
    res.json(productsWithSEO);
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
    
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null
    }));
    
    res.json(productsWithSEO);
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
    
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null
    }));
    
    res.json(productsWithSEO);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null
    }));
    
    res.json(productsWithSEO);
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
    
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null
    }));
    
    res.json(productsWithSEO);
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product by slug only
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const seoData = product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null;
    
    res.json({
      ...product.toObject(),
      seo: seoData
    });
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
    
    const seoData = product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null;
    
    res.json({
      ...product.toObject(),
      seo: seoData
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product by category + subcategory + slug
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
    
    const seoData = product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null;
    
    res.json({
      ...product.toObject(),
      seo: seoData
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product by ID with SEO
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
    
    const seoData = product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null;
    
    res.json({
      ...product.toObject(),
      seo: seoData
    });
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
    
    const seoData = product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null;
    
    res.json({
      ...product.toObject(),
      seo: seoData
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get bestsellers
router.get('/bestsellers', async (req, res) => {
  try {
    const products = await Product.find({ badge: 'Bestseller' });
    
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null
    }));
    
    res.json(productsWithSEO);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Generate SEO data for all existing products (Migration endpoint)
router.post('/generate-seo', async (req, res) => {
  try {
    const products = await Product.find({});
    let updated = 0;
    
    for (const product of products) {
      const cleanName = product.name.split("|")[0].trim();
      
      // Update SEO Title with your template
      product.seoTitle = `${cleanName} | Buy Tiruppur Cotton Kids Wear | Aazhi`;
      
      // Update SEO Description
      product.seoDescription = `Buy ${cleanName} online at Aazhi. Premium Tiruppur cotton kids wear made from soft breathable cotton. Comfortable, skin-friendly and perfect for everyday wear. Shop now!`;
      
      // Update SEO Keywords
      product.seoKeywords = [
        cleanName,
        "Tiruppur cotton kids wear",
        product.category,
        "baby clothes",
        "kids wear",
        "cotton baby clothes",
        "Aazhi"
      ];
      
      await product.save();
      updated++;
    }
    
    res.json({ 
      message: `SEO data generated for ${updated} products`,
      totalProcessed: products.length,
      updated
    });
  } catch (error) {
    console.error('Error generating SEO data:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;