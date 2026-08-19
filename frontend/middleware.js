export const config = {
  matcher: [
    // Match all paths except assets, sitemap, favicon, logo, robots
    '/((?!api/|sitemap\\.xml|robots\\.txt|assets/|uploads/|logo\\.png|favicon\\.ico|favicon-32x32.png|favicon-16x16.png|apple-touch-icon.png|site.webmanifest).*)',
  ],
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);

  // Crawler User-Agents (case-insensitive checks)
  const bots = [
    'googlebot', 'bingbot', 'yandex', 'baiduspider', 'twitterbot', 'facebookexternalhit',
    'facebot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview', 'showyoubot',
    'outbrain', 'pinterest', 'slackbot', 'vkShare', 'W3C_Validator', 'whatsapp', 'telegrambot'
  ];

  const isBot = bots.some(bot => userAgent.toLowerCase().includes(bot));

  if (isBot) {
    const pathParts = url.pathname.split('/').filter(Boolean); // e.g. ["Boys", "Shorts", "slug"]
    let destinationUrl = '';

    if (pathParts[0] === 'product' && pathParts[1]) {
      destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/product-by-id/${pathParts[1]}`;
    } else if (pathParts[0] === 'category' && pathParts[1]) {
      destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/category/${pathParts[1]}`;
    } else if (pathParts.length === 3) {
      // /:category/:subcategory/:slug
      destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/product/${pathParts[0]}/${pathParts[1]}/${pathParts[2]}`;
    } else if (pathParts.length === 1) {
      // /:slug fallback (excluding known static pages)
      const systemPages = ['cart', 'checkout', 'orders', 'profile', 'search', 'blog', 'combo'];
      if (!systemPages.includes(pathParts[0].toLowerCase())) {
        destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/product/all/all/${pathParts[0]}`;
      }
    }

    if (destinationUrl) {
      try {
        console.log(`Routing bot request to Render: ${destinationUrl}`);
        const response = await fetch(destinationUrl, {
          headers: {
            'User-Agent': userAgent
          }
        });
        return response;
      } catch (err) {
        console.error('Error fetching preview from Render:', err);
      }
    }
  }

  // Returning nothing tells Vercel to continue normal routing / serve static files
}
