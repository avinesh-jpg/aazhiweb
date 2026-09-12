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
    const products = await Product.find({ inStock: { $ne: false } }).sort({ createdAt: -1 });
    
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
      $and: [
        {
          $or: [
            { name: searchRegex },
            { category: searchRegex },
            { subcategory: searchRegex },
            { description: searchRegex }
          ]
        },
        { inStock: { $ne: false } }
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
    const products = await Product.find({ age, inStock: { $ne: false } }).sort({ createdAt: -1 });
    
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null
    }));
    
    res.json(productsWithSEO);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper: Create regex that matches spaces and hyphens interchangeably
const makeFlexibleRegex = (param) => {
  const decoded = decodeURIComponent(param);
  const escaped = decoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escaped.replace(/[-\s]+/g, '[- ]');
  return new RegExp(`^${pattern}$`, 'i');
};

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ 
      category: { $regex: makeFlexibleRegex(category) }, 
      inStock: { $ne: false } 
    }).sort({ createdAt: -1 });
    
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
    const products = await Product.find({ 
      subcategory: { $regex: makeFlexibleRegex(subcategoryName) }, 
      inStock: { $ne: false } 
    }).sort({ createdAt: -1 });
    
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
    
    const product = await Product.findOne({ 
      category: { $regex: makeFlexibleRegex(category) },
      subcategory: { $regex: makeFlexibleRegex(subcategory) },
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
    const products = await Product.find({ badge: 'Bestseller', inStock: { $ne: false } }).sort({ createdAt: -1 });
    
    const productsWithSEO = products.map(product => ({
      ...product.toObject(),
      seo: product.getSEOData ? product.getSEOData(process.env.BASE_URL) : null
    }));
    
    res.json(productsWithSEO);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper to escape HTML special characters
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Helper to generate social preview HTML for a product
function generateProductSEOHTML(product, canonicalUrl) {
  const pageTitle = product ? `${product.name} | Buy Tiruppur Cotton Kids Wear | Aazhi` : 'Aazhi - Organic Baby & Toddler Clothing';
  const priceText = product?.price ? `₹${product.price} - ` : '';
  const pageDesc = product 
    ? (product.description ? `${priceText}${product.description}` : `${priceText}Buy ${product.name} online at Aazhi. Premium Tiruppur cotton kids wear made from 100% soft breathable cotton.`)
    : 'Explore Aazhi\'s premium organic, comfortable baby and toddler clothing for ages 0-10. Sustainable, soft, and safe for your little ones.';
  
  let imageUrl = product?.image || (product?.images && product.images[0]) || 'https://theaazhi.com/aazhi-og-square-compressed.jpg';
  if (imageUrl.startsWith('/')) {
    imageUrl = `https://theaazhi.com${imageUrl}`;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(pageDesc)}" />
  
  <!-- Open Graph / Facebook / WhatsApp / Instagram -->
  <meta property="og:site_name" content="Aazhi" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHTML(pageTitle)}" />
  <meta property="og:description" content="${escapeHTML(pageDesc)}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta property="og:image:alt" content="${escapeHTML(product ? product.name : 'Aazhi')}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:locale" content="en_US" />
  <link rel="image_src" href="${imageUrl}" />
  
  ${product?.price ? `<meta property="product:price:amount" content="${product.price}" />
  <meta property="product:price:currency" content="INR" />` : ''}

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHTML(pageTitle)}" />
  <meta name="twitter:description" content="${escapeHTML(pageDesc)}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:site" content="@Aazhi" />

  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Instant Client Redirect for Real Users -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <script>window.location.replace("${canonicalUrl}");</script>
</head>
<body>
  <h1>${escapeHTML(product ? product.name : 'Aazhi - Organic Baby & Toddler Clothing')}</h1>
  <p>${escapeHTML(pageDesc)}</p>
  <img src="${imageUrl}" alt="${escapeHTML(product ? product.name : 'Aazhi')}" style="max-width:300px;height:auto;" />
</body>
</html>`;
}

// GET HTML preview of product by slug for crawlers/social media sharing
router.get('/seo-preview/product-by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({
      $or: [
        { slug: slug },
        { slug: { $regex: new RegExp(`^${slug}$`, 'i') } }
      ]
    });
    
    const categorySlug = product?.category ? product.category.toLowerCase().replace(/ /g, '-') : 'all';
    const subcategorySlug = product?.subcategory ? product.subcategory.toLowerCase().replace(/ /g, '-') : '';
    const canonicalUrl = subcategorySlug 
      ? `https://theaazhi.com/collections/${categorySlug}/${subcategorySlug}/products/${slug}`
      : `https://theaazhi.com/collections/${categorySlug}/products/${slug}`;
    
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.send(generateProductSEOHTML(product, canonicalUrl));
  } catch (error) {
    console.error('SEO product preview by slug error:', error);
    res.status(500).send('Error loading preview');
  }
});

// GET HTML preview of product by category/subcategory/slug for crawlers/social media sharing
router.get('/seo-preview/product/:category/:subcategory/:slug', async (req, res) => {
  try {
    const { category, subcategory, slug } = req.params;
    const product = await Product.findOne({
      $or: [
        { slug: slug },
        { slug: { $regex: new RegExp(`^${slug}$`, 'i') } }
      ]
    });
    
    const canonicalUrl = (category === 'all' && subcategory === 'all') 
      ? `https://theaazhi.com/products/${slug}` 
      : `https://theaazhi.com/collections/${category}/${subcategory}/products/${slug}`;
    
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.send(generateProductSEOHTML(product, canonicalUrl));
  } catch (error) {
    console.error('SEO product preview error:', error);
    res.status(500).send('Error loading preview');
  }
});

// GET HTML preview of product by ID for crawlers/social media sharing
router.get('/seo-preview/product-by-id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else if (!isNaN(parseInt(id))) {
      product = await Product.findOne({ productId: parseInt(id) });
    }
    
    const canonicalUrl = product?.slug 
      ? `https://theaazhi.com/collections/${(product.category || 'all').toLowerCase().replace(/ /g, '-')}/products/${product.slug}`
      : `https://theaazhi.com/product/${id}`;
    
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.send(generateProductSEOHTML(product, canonicalUrl));
  } catch (error) {
    console.error('SEO product by ID preview error:', error);
    res.status(500).send('Error loading preview');
  }
});

// GET HTML preview of category for crawlers/social media sharing
router.get('/seo-preview/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const cleanCategory = decodeURIComponent(category).replace(/-/g, ' ');
    const products = await Product.find({ 
      category: { $regex: new RegExp(`^${cleanCategory}$`, 'i') }, 
      inStock: { $ne: false } 
    }).limit(1);
    
    const pageTitle = `${cleanCategory} Premium Kids Wear | Aazhi`;
    const pageDesc = `Shop the latest ${cleanCategory} clothing collection at Aazhi. 100% soft cotton baby clothing and kids wear.`;
    const imageUrl = products.length > 0 && products[0].image ? products[0].image : 'https://theaazhi.com/aazhi-og-square-compressed.jpg';
    const categoryUrl = `https://theaazhi.com/collections/${category.toLowerCase()}`;
    
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(pageDesc)}" />
  
  <meta property="og:site_name" content="Aazhi" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHTML(pageTitle)}" />
  <meta property="og:description" content="${escapeHTML(pageDesc)}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta property="og:url" content="${categoryUrl}" />
  <meta property="og:locale" content="en_US" />
  <link rel="image_src" href="${imageUrl}" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHTML(pageTitle)}" />
  <meta name="twitter:description" content="${escapeHTML(pageDesc)}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <link rel="canonical" href="${categoryUrl}" />
  <meta http-equiv="refresh" content="0;url=${categoryUrl}">
  <script>window.location.replace("${categoryUrl}");</script>
</head>
<body>
  <h1>${escapeHTML(cleanCategory)} Collection</h1>
  <p>${escapeHTML(pageDesc)}</p>
</body>
</html>`);
  } catch (error) {
    console.error('SEO category preview error:', error);
    res.status(500).send('Error loading preview');
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