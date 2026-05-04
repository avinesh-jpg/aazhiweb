import mongoose from 'mongoose';

const emailOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { 
    type: Date, 
    required: true, 
    default: () => new Date(Date.now() + 10 * 60 * 1000) 
  },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

emailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('EmailOTP', emailOTPSchema);
