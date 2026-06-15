import mongoose from 'mongoose';

const shippingSettingSchema = new mongoose.Schema({
  freeShippingThreshold: { type: Number, default: 3000 },
  standardShippingRate: { type: Number, default: 70 },
  expressShippingRate: { type: Number, default: 200 },
  internationalShippingRate: { type: Number, default: 500 },
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ShippingSetting', shippingSettingSchema);