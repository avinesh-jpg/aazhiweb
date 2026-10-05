import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Initialize AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper: Upload Buffer to S3 & return CloudFront URL
const uploadBufferToS3 = async (file, folder = 'products') => {
  const originalName = file.originalname || 'image.jpg';
  const extension = originalName.split('.').pop() || 'jpg';
  const cleanFilename = `${folder}/${Date.now()}-${uuidv4()}.${extension}`;
  const contentType = file.mimetype || 'image/jpeg';

  const bucketName = process.env.AWS_BUCKET_NAME || 'aazhiweb-media-store-388094502958-ap-south-1-an';
  const region = process.env.AWS_REGION || 'ap-south-1';

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cleanFilename,
    Body: file.buffer,
    ContentType: contentType
  });

  await s3Client.send(command);

  const cloudfrontDomain = (process.env.AWS_CLOUDFRONT_DOMAIN || 'https://d2z8ta2ug99irq.cloudfront.net').replace(/\/$/, '');
  const cdnUrl = cloudfrontDomain 
    ? `${cloudfrontDomain}/${cleanFilename}`
    : `https://${bucketName}.s3.${region}.amazonaws.com/${cleanFilename}`;

  return {
    secure_url: cdnUrl,
    public_id: cleanFilename
  };
};

// Single image upload
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const result = await uploadBufferToS3(req.file);
    console.log('✅ Image uploaded to S3 / CloudFront:', result.secure_url);
    res.json({
      success: true,
      url: result.secure_url,
      filename: result.public_id
    });
  } catch (error) {
    console.error('❌ S3 Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Multiple images upload
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const uploadPromises = req.files.map(file => uploadBufferToS3(file));
    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => ({
      url: r.secure_url,
      filename: r.public_id
    }));
    console.log(`✅ ${urls.length} images uploaded to S3 / CloudFront`);
    res.json({ success: true, images: urls });
  } catch (error) {
    console.error('❌ Multiple S3 Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete image
router.delete('/image/:key(*)', async (req, res) => {
  try {
    const { key } = req.params;
    const bucketName = process.env.AWS_BUCKET_NAME || 'aazhiweb-media-store-388094502958-ap-south-1-an';

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);
    res.json({ success: true, message: 'Image deleted from S3' });
  } catch (error) {
    console.error('❌ S3 Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'AWS S3 & CloudFront upload service is active!',
    bucket: process.env.AWS_BUCKET_NAME || 'aazhiweb-media-store-388094502958-ap-south-1-an',
    cdn: process.env.AWS_CLOUDFRONT_DOMAIN || 'https://d2z8ta2ug99irq.cloudfront.net'
  });
});

export default router;