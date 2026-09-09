export const config = {
  matcher: [
    // Match all paths except assets, sitemap, favicon, logo, robots, images
    '/((?!api/|sitemap\\.xml|robots\\.txt|assets/|uploads/|logo\\.png|favicon\\.ico|favicon-32x32.png|favicon-16x16.png|apple-touch-icon.png|site.webmanifest|.*\\.(?:jpg|jpeg|png|webp|gif|svg|ico|css|js)$).*)',
  ],
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);

  // Crawler User-Agents (case-insensitive checks)
  const bots = [
    'whatsapp', 'facebookexternalhit', 'facebot', 'twitterbot', 'instagram',
    'linkedinbot', 'telegrambot', 'slackbot', 'pinterest', 'discordbot',
    'applebot', 'googlebot', 'bingbot', 'yandex', 'baiduspider', 'embedly',
    'quora link preview', 'showyoubot', 'outbrain', 'vkshare', 'w3c_validator'
  ];

  const isBot = bots.some(bot => userAgent.toLowerCase().includes(bot));

  if (isBot) {
    const pathParts = url.pathname.split('/').filter(Boolean); // e.g. ["collections", "boys", "products", "orange-urban-tshirt-pant"]
    let destinationUrl = '';

    const productsIdx = pathParts.indexOf('products');
    
    // 1. URLs containing "/products/:slug" (e.g. /collections/boys/products/slug or /products/slug)
    if (productsIdx !== -1 && pathParts[productsIdx + 1]) {
      const slug = pathParts[productsIdx + 1];
      destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/product/all/all/${slug}`;
    }
    // 2. URLs like "/product/:idOrSlug"
    else if (pathParts[0] === 'product' && pathParts[1]) {
      destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/product-by-id/${pathParts[1]}`;
    }
    // 3. URLs like "/collections/:category" or "/category/:category" (length 2 without products)
    else if ((pathParts[0] === 'collections' || pathParts[0] === 'category') && pathParts[1]) {
      destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/category/${pathParts[1]}`;
    }
    // 4. URLs like "/:category/:subcategory/:slug"
    else if (pathParts.length === 3) {
      destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/product/${pathParts[0]}/${pathParts[1]}/${pathParts[2]}`;
    }
    // 5. Fallback "/:slug" (excluding known static pages)
    else if (pathParts.length === 1) {
      const systemPages = ['cart', 'checkout', 'orders', 'profile', 'search', 'blog', 'blogs', 'combo', 'collections', 'about', 'contact', 'privacy-policy', 'terms'];
      if (!systemPages.includes(pathParts[0].toLowerCase())) {
        destinationUrl = `https://aazhiweb.onrender.com/api/products/seo-preview/product/all/all/${pathParts[0]}`;
      }
    }

    if (destinationUrl) {
      try {
        console.log(`Routing bot request to Render: ${destinationUrl}`);
        const response = await fetch(destinationUrl, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html'
          }
        });
        
        if (response.ok) {
          const html = await response.text();
          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
            }
          });
        }
      } catch (err) {
        console.error('Error fetching preview from Render:', err);
      }
    }
  }

  // Returning nothing tells Vercel to continue normal routing / serve static files
}
