import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import Product from '../models/Product.js';

// Resolve MongoDB SRV records reliably
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'aazhiweb-media-store-388094502958-ap-south-1-an';
const AWS_CLOUDFRONT_DOMAIN = (process.env.AWS_CLOUDFRONT_DOMAIN || 'https://d2z8ta2ug99irq.cloudfront.net').replace(/\/$/, '');

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Helper: Download image from URL and upload to S3
const transferImageToS3 = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) {
    return imageUrl; // Already non-cloudinary or empty
  }

  try {
    console.log(`  ⬇️ Downloading from Cloudinary: ${imageUrl}`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`  ⚠️ Failed to fetch ${imageUrl} (${response.statusText})`);
      return imageUrl;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    
    const s3Key = `products/migrated-${Date.now()}-${uuidv4().slice(0, 8)}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType
    });

    await s3Client.send(command);
    const newCdnUrl = `${AWS_CLOUDFRONT_DOMAIN}/${s3Key}`;
    console.log(`  ✅ Uploaded to S3: ${newCdnUrl}`);
    return newCdnUrl;
  } catch (err) {
    console.error(`  ❌ Error transferring image: ${err.message}`);
    return imageUrl;
  }
};

const runMigration = async () => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('❌ AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY missing in .env!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const products = await Product.find({ isDeleted: false });
    console.log(`Found ${products.length} products to check for Cloudinary images.`);

    let migratedCount = 0;

    for (const product of products) {
      console.log(`\n📦 Checking product #${product.productId}: "${product.name}"`);
      let modified = false;

      // 1. Main image
      if (product.image && product.image.includes('cloudinary')) {
        const newUrl = await transferImageToS3(product.image);
        if (newUrl !== product.image) {
          product.image = newUrl;
          modified = true;
        }
      }

      // 2. Images gallery array
      if (product.images && product.images.length > 0) {
        const updatedImages = [];
        for (const img of product.images) {
          if (img && img.includes('cloudinary')) {
            const newUrl = await transferImageToS3(img);
            updatedImages.push(newUrl);
            if (newUrl !== img) modified = true;
          } else {
            updatedImages.push(img);
          }
        }
        product.images = updatedImages;
      }

      // 3. Colors images
      if (product.colors && product.colors.length > 0) {
        for (const color of product.colors) {
          if (color.images && color.images.length > 0) {
            const updatedColorImages = [];
            for (const cImg of color.images) {
              if (cImg && cImg.includes('cloudinary')) {
                const newUrl = await transferImageToS3(cImg);
                updatedColorImages.push(newUrl);
                if (newUrl !== cImg) modified = true;
              } else {
                updatedColorImages.push(cImg);
              }
            }
            color.images = updatedColorImages;
          }
        }
      }

      if (modified) {
        await product.save();
        migratedCount++;
        console.log(`  💾 Updated product #${product.productId} in MongoDB.`);
      } else {
        console.log(`  ⏭️ No Cloudinary images needed migration for this product.`);
      }
    }

    console.log(`\n🎉 Migration Complete! Successfully migrated ${migratedCount} products to AWS S3 + CloudFront.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
