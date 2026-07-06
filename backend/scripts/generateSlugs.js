import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

dotenv.config();
connectDB();

const generateSlugs = async () => {
  try {
    console.log('🔄 Generating slugs for all products...');
    
    const products = await Product.find({ slug: { $exists: false } });
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      if (product.name) {
        let slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        // Check for duplicates
        const existing = await Product.findOne({ 
          slug: slug, 
          _id: { $ne: product._id } 
        });
        
        if (existing) {
          slug = `${slug}-${product.productId}`;
        }
        
        product.slug = slug;
        await product.save();
        updated++;
        console.log(`✅ ${product.name} -> ${slug}`);
      } else {
        skipped++;
      }
    }
    
    console.log(`\n🎉 Successfully generated slugs for ${updated} products!`);
    console.log(`⏭️ Skipped ${skipped} products (no name)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

generateSlugs();