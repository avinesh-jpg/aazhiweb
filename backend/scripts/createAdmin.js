import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aazhi');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');
    
    // Delete existing admin
    await adminsCollection.deleteMany({ email: 'admin@aazhi.com' });
    console.log('Deleted existing admin');
    
    // Hash password with bcrypt
    const plainPassword = 'JulyAugust@26';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    // Insert new admin
    const admin = {
      name: 'Super Admin',
      email: 'admin@aazhi.com',
      password: hashedPassword,
      role: 'super_admin',
      createdAt: new Date()
    };
    
    const result = await adminsCollection.insertOne(admin);
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@aazhi.com');
    console.log('🔑 Password: JulyAugust@26');
    console.log('Inserted ID:', result.insertedId);
    
    // Verify by testing password
    const savedAdmin = await adminsCollection.findOne({ email: 'admin@aazhi.com' });
    const isValid = await bcrypt.compare(plainPassword, savedAdmin.password);
    console.log('Password verification test:', isValid ? '✅ PASSED' : '❌ FAILED');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();