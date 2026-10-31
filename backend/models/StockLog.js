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
    enum: ['order', 'manual_adjustment', 'restock', 'order_cancelled', 'product_edit'],
    default: 'manual_adjustment'
  },
  orderNumber: { type: String, default: null, index: true },
  note: { type: String, default: '' },
  deviceName: { type: String, default: 'Web Admin' },
  performedBy: { type: String, default: '' },
  customerDetails: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  initialStockChange: {
    previous: { type: Number, default: null },
    current: { type: Number, default: null }
  },
  ip: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default mongoose.model('StockLog', stockLogSchema);
