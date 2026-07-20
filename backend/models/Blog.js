import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  tags: [{ type: String }],
  author: { type: String, default: 'Admin' },
  readTime: { type: String, default: '5 min read' },
  status: { type: String, enum: ['draft', 'published'], default: 'published' }
}, { timestamps: true });

// Auto-generate unique slug from title
blogSchema.pre('save', async function(next) {
  if (this.title && !this.slug) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const existing = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    this.slug = slug;
  }
  next();
});

export default mongoose.model('Blog', blogSchema);
