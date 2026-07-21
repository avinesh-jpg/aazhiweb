// routes/seoRoutes.js
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// ✅ Helper function to escape XML special characters
const escapeXML = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// ✅ Helper function to escape URL
const escapeURL = (url) => {
  if (!url) return '';
  // Escape ampersands in URLs for XML
  return url.replace(/&/g, '&amp;');
};

// Generate sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || 'https://theaazhi.com';
    const products = await Product.find({});
    
    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/blog', priority: '0.7', changefreq: 'weekly' },
      { url: '/shipping', priority: '0.6', changefreq: 'monthly' },
      { url: '/returns', priority: '0.6', changefreq: 'monthly' }
    ];
    
    // Get all unique categories
    const categories = await Product.distinct('category');
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
    
    // Static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`;
    });
    
    // Category pages
    categories.forEach((category) => {
      const escapedCategory = escapeXML(category);
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${escapedCategory.toLowerCase().replace(/ /g, '-')}</loc>
    <priority>0.9</priority>
    <changefreq>weekly</changefreq>
  </url>`;
    });
    
    // Product pages
    products.forEach(product => {
      // ✅ Escape product name for XML
      const escapedName = escapeXML(product.name);
      const escapedImage = escapeURL(product.image || '');
      
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product._id}</loc>
    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>`;
      
      // Add product images for image sitemap
      if (product.image) {
        sitemap += `
    <image:image>
      <image:loc>${escapeURL(product.image)}</image:loc>
      <image:title>${escapedName}</image:title>
    </image:image>`;
      }
      
      if (product.images && product.images.length > 0) {
        product.images.forEach(image => {
          if (image) {
            sitemap += `
    <image:image>
      <image:loc>${escapeURL(image)}</image:loc>
      <image:title>${escapedName}</image:title>
    </image:image>`;
          }
        });
      }
      
      sitemap += `
  </url>`;
    });
    
    sitemap += `
</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Generate robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://theaazhi.com';
  
  const robots = `# www.robotstxt.org
User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /cart
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Host
Host: ${baseUrl.replace('https://', '')}

# Googlebot
User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /cart
Crawl-delay: 0.5

# Bingbot
User-agent: bingbot
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /cart
Crawl-delay: 1`;
  
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

export default router;