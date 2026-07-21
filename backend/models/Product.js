// models/Product.js
import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  images: [{ type: String }]
});

const sizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 }
});

const productSchema = new mongoose.Schema({
  productId: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  slug: { 
    type: String,
    unique: true,
    sparse: true
  },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null },
  badge: { type: String, default: null },
  image: { type: String, required: true },
  images: [{ type: String }],
  colors: [colorSchema],
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  age: { type: String },
  description: { type: String, required: true },
  sizes: [sizeSchema],
  material: { type: String },
  care: { type: String },
  inStock: { type: Boolean, default: true },
  
  // ✅ SEO Fields - Add these
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [{ type: String }],
  metaRobots: { type: String, default: 'index, follow' },
  canonicalUrl: { type: String }
}, { timestamps: true });

// ✅ Auto-generate SEO title with your template
productSchema.pre('save', async function(next) {
  // Generate slug if not exists
  if (this.name && !this.slug) {
    let slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const existing = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
    if (existing) {
      slug = `${slug}-${this.productId}`;
    }
    this.slug = slug;
  }
  
  // ✅ Auto-generate SEO Title with your exact template
  if (!this.seoTitle) {
    const cleanName = this.name.split("|")[0].trim();
    // ✅ YOUR EXACT TEMPLATE
    this.seoTitle = `${cleanName} | Buy Tiruppur Cotton Kids Wear | Aazhi`;
  }
  
  // ✅ Auto-generate SEO Description
  if (!this.seoDescription) {
    const cleanName = this.name.split("|")[0].trim();
    this.seoDescription = `Buy ${cleanName} online at Aazhi. Premium Tiruppur cotton kids wear made from soft breathable cotton. Comfortable, skin-friendly and perfect for everyday wear. Shop now!`;
  }
  
  // ✅ Auto-generate SEO Keywords
  if (!this.seoKeywords || this.seoKeywords.length === 0) {
    const cleanName = this.name.split("|")[0].trim();
    this.seoKeywords = [
      cleanName,
      "Tiruppur cotton kids wear",
      this.category,
      "baby clothes",
      "kids wear",
      "cotton baby clothes",
      "newborn clothes",
      "Aazhi"
    ];
  }
  
  // Auto-update inStock based on sizes
  const hasStock = this.sizes.some(size => size.stock > 0);
  this.inStock = hasStock;
  
  next();
});

// ✅ Method to get SEO data
productSchema.methods.getSEOData = function(baseUrl) {
  return {
    title: this.seoTitle || `${this.name} | Buy Tiruppur Cotton Kids Wear | Aazhi`,
    description: this.seoDescription || `Buy ${this.name} online at Aazhi. Premium Tiruppur cotton kids wear.`,
    keywords: this.seoKeywords || [this.name, "Tiruppur cotton kids wear", this.category, "Aazhi"],
    image: this.image,
    url: `${baseUrl}/product/${this._id}`,
    type: 'product',
    canonicalUrl: this.canonicalUrl || `${baseUrl}/product/${this._id}`,
    metaRobots: this.metaRobots || 'index, follow',
    structuredData: this.getStructuredData(baseUrl)
  };
};

// ✅ Method to get structured data
productSchema.methods.getStructuredData = function(baseUrl) {
  const availability = this.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": this.name,
    "description": this.description || this.seoDescription,
    "image": this.image,
    "brand": {
      "@type": "Brand",
      "name": "Aazhi"
    },
    "offers": {
      "@type": "Offer",
      "price": this.price,
      "priceCurrency": "INR",
      "availability": availability,
      "url": `${baseUrl}/product/${this._id}`,
      "seller": {
        "@type": "Organization",
        "name": "Aazhi"
      }
    },
    ...(this.sizes && this.sizes.length > 0 && {
      "size": this.sizes.map(s => s.name).join(', ')
    }),
    ...(this.colors && this.colors.length > 0 && {
      "color": this.colors.map(c => c.name).join(', ')
    })
  };
};

export default mongoose.model('Product', productSchema);