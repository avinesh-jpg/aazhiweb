import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateAdminPassword = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const Admin = (await import('../models/Admin.js')).default;
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admin(s) in database.`);

    const newPlainPassword = 'JulyAugust@26';

    if (admins.length === 0) {
      console.log('No admins found, creating default admin...');
      const admin = new Admin({
        name: 'Super Admin',
        email: 'admin@theaazhi.com',
        password: newPlainPassword,
        role: 'super_admin'
      });
      await admin.save();
      console.log(`Created admin with email: ${admin.email}`);
    } else {
      for (const admin of admins) {
        console.log(`Updating password for: ${admin.email} (ID: ${admin._id})`);
        admin.password = newPlainPassword; // Pre-save hook hashes it
        await admin.save();
        console.log(`Successfully updated password for: ${admin.email}`);
      }
    }

    // Verify
    const updatedAdmins = await Admin.find({});
    console.log('\n--- Verification ---');
    for (const a of updatedAdmins) {
      const isMatch = await a.comparePassword(newPlainPassword);
      console.log(`Admin [${a.email}]: Password match test = ${isMatch ? 'PASSED ✅' : 'FAILED ❌'}`);
    }

    await mongoose.disconnect();
    console.log('Database disconnected. All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
};

updateAdminPassword();
