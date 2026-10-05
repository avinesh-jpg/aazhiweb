import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testUpload() {
  try {
    console.log('Testing AWS S3 Connection...');
    console.log('Bucket:', process.env.AWS_BUCKET_NAME);
    console.log('Region:', process.env.AWS_REGION);
    console.log('CloudFront:', process.env.AWS_CLOUDFRONT_DOMAIN);

    const testKey = `test/test-${Date.now()}.txt`;
    const testContent = 'Hello from Aazhi AWS S3 + CloudFront Integration!';

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain'
    });

    const response = await s3Client.send(command);
    console.log('\n✅ S3 Upload Successful!');
    console.log('S3 ETag:', response.ETag);
    console.log(`CloudFront URL: ${process.env.AWS_CLOUDFRONT_DOMAIN}/${testKey}`);
  } catch (error) {
    console.error('\n❌ S3 Test Failed:', error);
  }
}

testUpload();
