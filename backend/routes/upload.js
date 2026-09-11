import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'egdythgl',
  api_key: process.env.CLOUDINARY_API_KEY || '381581618352664',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'yNDDf4ipUKJXKXXBTURI_ShdbIw'
});

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadBufferToCloudinary = (buffer, folder = 'aazhi/products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Single image upload
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const result = await uploadBufferToCloudinary(req.file.buffer);
    console.log('Image uploaded to Cloudinary:', result.secure_url);
    res.json({
      success: true,
      url: result.secure_url,
      filename: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Multiple images upload
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const uploadPromises = req.files.map(file => uploadBufferToCloudinary(file.buffer));
    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => ({
      url: r.secure_url,
      filename: r.public_id
    }));
    console.log(`${urls.length} images uploaded to Cloudinary`);
    res.json({ success: true, images: urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete image
router.delete('/image/:publicId(*)', async (req, res) => {
  try {
    const { publicId } = req.params;
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Cloudinary upload routes are working!' });
});

export default router;