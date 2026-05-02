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
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-update inStock based on sizes
productSchema.pre('save', function(next) {
  const hasStock = this.sizes.some(size => size.stock > 0);
  this.inStock = hasStock;
  next();
});

export default mongoose.model('Product', productSchema);