import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: null },
  guestEmail: { type: String, default: null, index: true },
  guestName: { type: String, default: null },
  guestMobile: { type: String, default: null },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'razorpay', 'card', 'upi'],
    default: 'razorpay'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  emailSent: { type: Boolean, default: false },
  stockDeducted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  try {
    if (!this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      // Get count of orders today
      const startOfDay = new Date(year, date.getMonth(), date.getDate());
      const count = await mongoose.model('Order').countDocuments({
        createdAt: { $gte: startOfDay }
      });
      
      this.orderNumber = `TINY${year}${month}${day}${hours}${minutes}${seconds}${String(count + 1).padStart(3, '0')}`;
      console.log(`Generated order number: ${this.orderNumber}`);
    }
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    console.error('Error generating order number:', error);
    next(error);
  }
});

// Deduct stock when order is confirmed
orderSchema.pre('save', async function(next) {
  if (this.status === 'confirmed' && !this.stockDeducted) {
    try {
      console.log(`Deducting stock for order: ${this.orderNumber || this._id}`);
      for (const item of this.items) {
        const productId = parseInt(item.productId);
        if (!isNaN(productId)) {
          const product = await mongoose.model('Product').findOne({ productId });
          if (product) {
            const sizeObj = product.sizes.find(s => s.name === item.size);
            if (sizeObj) {
              sizeObj.stock = Math.max(0, sizeObj.stock - item.quantity);
              // Save the product (triggers recalculation of inStock)
              await product.save();
              console.log(`✅ Deducted ${item.quantity} units of size "${item.size}" for product ID ${productId}. New stock: ${sizeObj.stock}`);
            } else {
              console.warn(`⚠️ Size "${item.size}" not found on product ID ${productId}`);
            }
          } else {
            console.warn(`⚠️ Product ID ${productId} not found during stock deduction`);
          }
        }
      }
      this.stockDeducted = true;
    } catch (error) {
      console.error('❌ Error deducting stock on order confirmation:', error);
    }
  }
  next();
});
export default mongoose.model('Order', orderSchema);