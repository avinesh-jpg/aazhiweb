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

// Add after other routes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration this is for main hosting
// CORS configuration
// CORS configuration - REPLACE your current cors() setup with this:

// Enable preflight for all routes
app.options('*', cors()); // This handles OPTIONS preflight requests

// Your main CORS configuration
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://127.0.0.1:8080', 
    'http://localhost:5173',
    'https://aazhiweb.vercel.app',
    'https://theaazhi.com',
    'https://tiinyberryy.vercel.app',
    'https://aazhiweb.onrender.com/'  // ← ADD THIS LINE (YOUR CURRENT FRONTEND URL)
    // Add any other frontend URLs you're using
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

// CORS configuration
/*app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));*/

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
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
      'debug-routes': '/api/debug-routes'
    }
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 MongoDB connected - Data is now persistent!`);
});
