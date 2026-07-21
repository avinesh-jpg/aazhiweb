// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import emailOTPRoutes from './routes/email-otp.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import subcategoryRoutes from './routes/subcategories.js';
import { errorHandler } from './middleware/errorHandler.js';
import shippingRoutes from './routes/shipping.js';
import combosRoutes from './routes/combo.js';
import blogRoutes from './routes/blog.js';
import seoRoutes from './routes/seoRoutes.js'; // ✅ NEW: SEO Routes
import { seoMiddleware } from './middleware/seoMiddleware.js'; // ✅ NEW: SEO Middleware
import Product from './models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable preflight for all routes
app.options('*', cors());

// Your main CORS configuration
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://127.0.0.1:8080', 
    'http://localhost:5173',
    'https://aazhiweb.vercel.app',
    'https://theaazhi.com',
    'https://tiinyberryy.vercel.app',
    'https://aazhiweb.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Apply SEO middleware to all routes
app.use(seoMiddleware);

// =============================================
// ✅ SEO ROUTES (Sitemap & Robots)
// =============================================
app.use('/', seoRoutes); // Adds /sitemap.xml and /robots.txt

// =============================================
// ✅ SLUG-BASED API ROUTES (Case-insensitive) WITH SEO
// =============================================

// =============================================
// ✅ NEW: Direct route without /product prefix
// URL: /api/category/Boys/Shorts-Sets-With-Rope/half-white-lion-zebra-shorts
// =============================================
app.get('/api/category/:category/:subcategory/:slug', async (req, res) => {
  try {
    const { category, subcategory, slug } = req.params;
    
    // Decode URL parameters (replace hyphens with spaces)
    const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');
    const decodedSubcategory = decodeURIComponent(subcategory).replace(/-/g, ' ');
    
    console.log('Searching for (category route):', { decodedCategory, decodedSubcategory, slug });
    
    // Find product with case-insensitive matching
    const product = await Product.findOne({
      category: { $regex: new RegExp(`^${decodedCategory}$`, 'i') },
      subcategory: { $regex: new RegExp(`^${decodedSubcategory}$`, 'i') },
      slug: slug
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // ✅ Add SEO data to response
    const seoData = product.getSEOData ? product.getSEOData(process.env.BASE_URL || 'https://theaazhi.com') : null;
    
    res.json({
      ...product.toObject(),
      seo: seoData
    });
  } catch (error) {
    console.error('Error fetching product by category:', error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================
// ✅ EXISTING: Get product by category + subcategory + slug (with /product)
// URL: /api/product/Boys/Shorts-Sets-With-Rope/half-white-lion-zebra-shorts
// =============================================
app.get('/api/product/:category/:subcategory/:slug', async (req, res) => {
  try {
    const { category, subcategory, slug } = req.params;
    
    // Decode URL parameters (replace hyphens with spaces)
    const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');
    const decodedSubcategory = decodeURIComponent(subcategory).replace(/-/g, ' ');
    
    console.log('Searching for (product route):', { decodedCategory, decodedSubcategory, slug });
    
    // Find product with case-insensitive matching
    const product = await Product.findOne({
      category: { $regex: new RegExp(`^${decodedCategory}$`, 'i') },
      subcategory: { $regex: new RegExp(`^${decodedSubcategory}$`, 'i') },
      slug: slug
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // ✅ Add SEO data to response
    const seoData = product.getSEOData ? product.getSEOData(process.env.BASE_URL || 'https://theaazhi.com') : null;
    
    res.json({
      ...product.toObject(),
      seo: seoData
    });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product by category + slug (no subcategory)
app.get('/api/product/:category/:slug', async (req, res) => {
  try {
    const { category, slug } = req.params;
    
    const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');
    
    console.log('Searching for:', { decodedCategory, slug });
    
    const product = await Product.findOne({
      category: { $regex: new RegExp(`^${decodedCategory}$`, 'i') },
      slug: slug
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // ✅ Add SEO data to response
    const seoData = product.getSEOData ? product.getSEOData(process.env.BASE_URL || 'https://theaazhi.com') : null;
    
    res.json({
      ...product.toObject(),
      seo: seoData
    });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by category with subcategory
app.get('/api/product/:category/:subcategory', async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    
    const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');
    const decodedSubcategory = decodeURIComponent(subcategory).replace(/-/g, ' ');
    
    const products = await Product.find({
      category: { $regex: new RegExp(`^${decodedCategory}$`, 'i') },
      subcategory: { $regex: new RegExp(`^${decodedSubcategory}$`, 'i') }
    });
    
    // ✅ Add SEO data to each product
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL || 'https://theaazhi.com') : null
    }));
    
    res.json(productsWithSEO);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
app.get('/api/product/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');
    
    const products = await Product.find({
      category: { $regex: new RegExp(`^${decodedCategory}$`, 'i') }
    });
    
    // ✅ Add SEO data to each product
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL || 'https://theaazhi.com') : null
    }));
    
    res.json(productsWithSEO);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================
// EXISTING ROUTES (UNCHANGED)
// =============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tiiny Berry API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Tiiny Berry API is running!',
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      wishlist: '/api/wishlist',
      auth: '/api/auth',
      orders: '/api/orders',
      'email-otp': '/api/email-otp',
      payment: '/api/payment',
      admin: '/api/admin',
      upload: '/api/upload',
      subcategories: '/api/subcategories',
      health: '/api/health',
      'debug-routes': '/api/debug-routes',
      'product-slug-routes': '/api/product/:category/:subcategory/:slug',
      'category-slug-routes': '/api/category/:category/:subcategory/:slug',
      // ✅ SEO endpoints
      'sitemap': '/sitemap.xml',
      'robots': '/robots.txt'
    }
  });
});

// Your API Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/email-otp', emailOTPRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/blog', blogRoutes);

// Debug route - list all endpoints
app.get('/api/debug-routes', (req, res) => {
  const routes = [];
  
  const extractRoutes = (stack, basePath = '') => {
    if (!stack) return;
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ');
        routes.push(`${methods.toUpperCase()} ${basePath}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        const routerPath = basePath + (layer.regexp.source.replace(/\\/g, '').replace(/\^/g, '').replace(/\?/g, '').replace(/\/i/g, ''));
        extractRoutes(layer.handle.stack, routerPath);
      }
    });
  };
  
  if (app._router && app._router.stack) {
    extractRoutes(app._router.stack);
  }
  
  res.json({ routes });
});

// Error handler (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 MongoDB connected - Data is now persistent!`);
  console.log(`🔗 Category route: http://localhost:${PORT}/api/category/Boys/Shorts-Sets-With-Rope/half-white-lion-zebra-shorts`);
  console.log(`🔗 Product route: http://localhost:${PORT}/api/product/Boys/Shorts-Sets-With-Rope/half-white-lion-zebra-shorts`);
  console.log(`📍 Base URL: ${process.env.BASE_URL || 'http://localhost:5000'}`);
  console.log(`📝 Sitemap: ${process.env.BASE_URL || 'http://localhost:5000'}/sitemap.xml`);
  console.log(`🤖 Robots: ${process.env.BASE_URL || 'http://localhost:5000'}/robots.txt`);
});