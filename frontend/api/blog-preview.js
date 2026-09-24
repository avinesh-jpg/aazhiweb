export default async function handler(req, res) {
  const { slug } = req.query;
  const baseUrl = 'https://theaazhi.com';
  const defaultImage = `${baseUrl}/aazhi-og-square-compressed.jpg`;
  const defaultTitle = 'Aazhi Blog – Baby Clothing Guides & Parenting Stories';
  const defaultDescription = "Explore Aazhi's blog for parenting tips, baby clothing guides, organic fabric choices, and behind-the-scenes stories from India's textile capital, Tiruppur.";

  let title = defaultTitle;
  let description = defaultDescription;
  let image = defaultImage;
  let targetUrl = `${baseUrl}/blog`;

  if (slug) {
    targetUrl = `${baseUrl}/blog/${slug}`;
    try {
      const response = await fetch(`https://aazhiweb.onrender.com/api/blog/slug/${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        const blog = data.blog;
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
            image = blog.coverImage.startsWith('http')
              ? blog.coverImage
              : `https://aazhiweb.onrender.com${blog.coverImage}`;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching blog for preview:', err);
    }
  }

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
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(targetUrl);

  const html = `<!doctype html>
<html lang="en">
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

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${safeUrl}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
  <meta name="twitter:site" content="@Aazhi" />

  <link rel="canonical" href="${safeUrl}" />

  <!-- Instant redirect for normal browsers if they ever hit this endpoint -->
  <meta http-equiv="refresh" content="0;url=${safeUrl}" />
  <script>
    window.location.replace("${safeUrl}");
  </script>
</head>
<body>
  <p>Redirecting to <a href="${safeUrl}">${safeTitle}</a>...</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
