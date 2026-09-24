export default async function handler(req, res) {
  const { slug } = req.query;
  const baseUrl = 'https://theaazhi.com';
  const defaultImage = 'https://res.cloudinary.com/egdythgl/image/upload/c_fill,w_1200,h_630,q_auto/aazhi-og-square-compressed.jpg';
  const defaultTitle = 'Aazhi Blog – Baby Clothing Guides & Parenting Stories';
  const defaultDescription = "Explore Aazhi's blog for parenting tips, baby clothing guides, organic fabric choices, and behind-the-scenes stories from India's textile capital, Tiruppur.";

  let title = defaultTitle;
  let description = defaultDescription;
  let rawImage = defaultImage;
  let targetUrl = `${baseUrl}/blog`;

  if (slug) {
    const cleanSlug = String(slug).replace(/\/+$/, '');
    targetUrl = `${baseUrl}/blog/${cleanSlug}`;

    try {
      let blog = null;

      // 1. Direct slug lookup
      const directRes = await fetch(`https://aazhiweb.onrender.com/api/blog/slug/${encodeURIComponent(cleanSlug)}`);
      if (directRes.ok) {
        const data = await directRes.json();
        blog = data.blog;
      }

      // 2. Fuzzy fallback if exact slug didn't match
      if (!blog) {
        const listRes = await fetch('https://aazhiweb.onrender.com/api/blog');
        if (listRes.ok) {
          const listData = await listRes.json();
          const blogs = listData.blogs || [];
          const normalizedQuery = cleanSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
          blog = blogs.find(b => {
            const s = (b.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const t = (b.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return s === normalizedQuery || normalizedQuery.includes(s) || s.includes(normalizedQuery) || t.includes(normalizedQuery);
          });
        }
      }

      if (blog) {
        title = `${blog.title} | Aazhi Blog`;
        
        if (blog.summary && blog.summary.length > 30 && blog.summary.toLowerCase() !== blog.title.toLowerCase()) {
          description = blog.summary;
        } else if (blog.content) {
          let clean = blog.content
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          if (clean.length > 200) {
            clean = clean.slice(0, 197) + '...';
          }
          description = clean || blog.summary || blog.title;
        } else {
          description = blog.summary || blog.title;
        }

        if (blog.coverImage) {
          rawImage = blog.coverImage.startsWith('http')
            ? blog.coverImage
            : `https://aazhiweb.onrender.com${blog.coverImage}`;
        }
      }
    } catch (err) {
      console.error('Error fetching blog for preview:', err);
    }
  }

  // Optimize image to high-compatibility 1200x630 JPG under 100KB for WhatsApp and Facebook
  const getOptimizedImageUrl = (url, fallback) => {
    if (!url) return fallback;
    let full = url;
    if (!full.startsWith('http')) {
      full = `https://aazhiweb.onrender.com${full}`;
    }
    
    // Cloudinary direct upload optimization
    if (full.includes('res.cloudinary.com')) {
      if (full.includes('/image/upload/')) {
        let transformed = full.replace('/image/upload/', '/image/upload/c_fill,w_1200,h_630,q_auto,f_jpg/');
        // Ensure ends in .jpg for scraper compatibility
        return transformed.replace(/\.(png|webp|jpeg)$/i, '.jpg');
      }
      return full;
    }

    // Cloudinary fetch proxy for external URLs
    return `https://res.cloudinary.com/egdythgl/image/fetch/c_fill,w_1200,h_630,q_auto,f_jpg/${full}`;
  };

  const finalImage = getOptimizedImageUrl(rawImage, defaultImage);

  // Escape HTML entities to prevent injection
  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(finalImage);
  const safeUrl = escapeHtml(targetUrl);

  const html = `<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />

  <!-- Open Graph / WhatsApp / Facebook / LinkedIn / Telegram -->
  <meta property="og:site_name" content="Aazhi" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <link rel="image_src" href="${safeImage}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${safeUrl}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
  <meta name="twitter:site" content="@Aazhi" />

  <link rel="canonical" href="${safeUrl}" />
</head>
<body>
  <script>
    window.location.replace("${safeUrl}");
  </script>
  <p>Redirecting to <a href="${safeUrl}">${safeTitle}</a>...</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
