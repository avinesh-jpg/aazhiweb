import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateCoupons = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const Coupon = (await import('../models/Coupon.js')).default;
    
    // Clear all existing coupons
    console.log('Clearing existing coupons...');
    await Coupon.deleteMany({});
    
    // Insert new coupons
    const newCoupons = [
      { code: 'LAUNCH100', threshold: 2000, discount: 100, isActive: true },
      { code: 'LAUNCH200', threshold: 3000, discount: 200, isActive: true }
    ];
    
    await Coupon.create(newCoupons);
    console.log('Successfully seeded new coupons:');
    console.log('- LAUNCH100: spend 2000, get 100 off');
    console.log('- LAUNCH200: spend 3000, get 200 off');

    await mongoose.disconnect();
    console.log('Database disconnected. All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating coupons:', error);
    process.exit(1);
  }
};

updateCoupons();
