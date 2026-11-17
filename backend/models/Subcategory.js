import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  path: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isNewBadge: { type: Boolean, default: false }, // 👈 this  is for a new badge sale on a navbar view 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Subcategory', subcategorySchema);