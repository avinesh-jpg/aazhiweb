import express from 'express';
import jwt from 'jsonwebtoken';
import Blog from '../models/Blog.js';
import Admin from '../models/Admin.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tiinyberry_secret_key_2024';

// Helper to calculate read time
const calculateReadTime = (content) => {
  if (!content) return '1 min read';
  const wordsPerMinute = 200;
  const cleanContent = content.replace(/<[^>]*>/g, ''); // strip HTML tags
  const words = cleanContent.trim().split(/\s+/).filter(w => w.length > 0).length;
  const time = Math.ceil(words / wordsPerMinute) || 1;
  return `${time} min read`;
};

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// =============================================
// PUBLIC ENDPOINTS
// =============================================

// Get all published blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get blog by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, status: 'published' });
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ADMIN ENDPOINTS (Protected)
// =============================================

// Get all blogs (including drafts) for admin dashboard
router.get('/admin', authAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a blog post
router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, summary, content, coverImage, tags, status, author } = req.body;
    
    if (!title || !summary || !content) {
      return res.status(400).json({ success: false, message: 'Title, summary, and content are required' });
    }

    const readTime = calculateReadTime(content);
    
    const blog = new Blog({
      title,
      summary,
      content,
      coverImage: coverImage || '',
      tags: tags || [],
      status: status || 'published',
      author: author || 'Admin',
      readTime
    });

    await blog.save();
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a blog post
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, coverImage, tags, status, author, slug } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    if (title) blog.title = title;
    if (summary) blog.summary = summary;
    if (content) {
      blog.content = content;
      blog.readTime = calculateReadTime(content);
    }
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (tags) blog.tags = tags;
    if (status) blog.status = status;
    if (author) blog.author = author;
    
    // Allow admin to override/reset slug, or auto generate if cleared
    if (slug !== undefined) {
      if (slug.trim() === '') {
        // will trigger pre-save hook slug generation
        blog.slug = undefined;
      } else {
        blog.slug = slug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
    }

    await blog.save();
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a blog post
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Blog.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
