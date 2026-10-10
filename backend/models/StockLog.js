import mongoose from 'mongoose';

const stockLogSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  productName: { type: String, default: '' },
  size: { type: String, default: '', index: true },
  change: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['order', 'manual_adjustment', 'restock', 'order_cancelled'],
    default: 'manual_adjustment'
  },
  orderNumber: { type: String, default: null, index: true },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default mongoose.model('StockLog', stockLogSchema);
