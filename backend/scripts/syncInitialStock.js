import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Product from '../models/Product.js';

// Resolve MongoDB SRV records reliably
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const syncInitialStock = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to process.`);

    let updatedProductsCount = 0;
    let updatedSizesCount = 0;

    for (const product of products) {
      let modified = false;

      if (product.sizes && product.sizes.length > 0) {
        for (const size of product.sizes) {
          // If initialStock is not set or 0, sync it to current stock
          if (size.initialStock === undefined || size.initialStock === null || size.initialStock === 0) {
            size.initialStock = size.stock || 0;
            updatedSizesCount++;
            modified = true;
          }
        }
      }

      if (modified) {
        // Mark sizes as modified to ensure Mongoose saves the nested subdocs
        product.markModified('sizes');
        await product.save();
        updatedProductsCount++;
      }
    }

    console.log(`\n🎉 Stock Sync Complete!`);
    console.log(`- Updated ${updatedSizesCount} sizes across ${updatedProductsCount} products.`);
    console.log(`- All products now have their current stock set as their baseline initialStock.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing initial stock:', error);
    process.exit(1);
  }
};

syncInitialStock();
