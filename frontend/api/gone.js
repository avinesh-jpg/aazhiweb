export default function handler(req, res) {
  // Tell search engines never to index or archive this page, and that it is permanently gone
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  
  res.status(410).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>410 Gone - The Aazhi</title>
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #fafafa;
      color: #333;
      text-align: center;
      padding: 1rem;
    }
    .box {
      max-width: 440px;
      width: 100%;
      padding: 2.5rem 2rem;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      border: 1px solid #eee;
    }
    h1 {
      font-size: 3rem;
      margin: 0 0 0.5rem;
      color: #e11d48;
      font-weight: 800;
    }
    p {
      margin: 0.5rem 0 1.5rem;
      color: #666;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    a {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #7c3aed;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    a:hover {
      background: #6d28d9;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>410</h1>
    <p>This page has been permanently removed and is no longer available.</p>
    <a href="https://theaazhi.com/">Return to Store</a>
  </div>
</body>
</html>`);
}
