import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with production API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Production configuration
//const FROM_EMAIL = process.env.FROM_EMAIL || 'Aazhi <noreply@aazhi.com>';
const FROM_EMAIL = 'onboarding@resend.dev';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ENABLE_RATE_LIMITING = process.env.ENABLE_RATE_LIMITING === 'true';
const MAX_RETRIES = parseInt(process.env.MAX_EMAIL_RETRIES) || 3;
const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS) || 5000;

// In-memory rate limiting store (use Redis for production with multiple instances)
const rateLimitStore = new Map();

// Utility: Escape HTML to prevent XSS attacks
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
};

// Utility: Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return emailRegex.test(email);
};

// Utility: Rate limiting check
const checkRateLimit = (key, windowMs = 3600000, maxRequests = 3) => {
  if (!ENABLE_RATE_LIMITING) return { allowed: true };
  
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  if (record.count >= maxRequests) {
    const waitTime = Math.ceil((record.resetTime - now) / 60000);
    return { allowed: false, waitTime };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (Date.now() > v.resetTime) rateLimitStore.delete(k);
    }
  }
  
  return { allowed: true };
};

// Utility: Delay function for retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate OTP email HTML
const generateOTPEmailHTML = (otp, userName) => {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email OTP - Aazhi</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 32px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: 2px;
        }
        .header p {
          margin: 8px 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 32px;
        }
        .otp-code {
          background: #f7f9fc;
          padding: 24px;
          text-align: center;
          border-radius: 12px;
          margin: 24px 0;
          border: 2px dashed #e2e8f0;
        }
        .otp-code span {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 12px;
          color: #667eea;
          font-family: 'Courier New', monospace;
        }
        .info-text {
          color: #64748b;
          font-size: 14px;
          text-align: center;
          margin-top: 16px;
        }
        .footer {
          text-align: center;
          padding: 24px;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          background-color: #fafbfc;
        }
        .alert {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
        }
        @media (max-width: 600px) {
          .content { padding: 20px; }
          .otp-code span { font-size: 28px; letter-spacing: 8px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Aazhi ✨</h1>
          <p>Secure Email Verification</p>
        </div>
        <div class="content">
          <h2>Hello ${escapeHtml(userName) || 'Valued Customer'}!</h2>
          <p>We received a request to login to your Aazhi account. Please use the verification code below to complete your login:</p>
          
          <div class="otp-code">
            <span>${escapeHtml(otp)}</span>
          </div>
          
          <p>🔐 This code will expire in <strong>10 minutes</strong>.</p>
          <div class="info-text">
            ⚠️ For security reasons, <strong>never share this code</strong> with anyone, including Aazhi support.
          </div>
          
          <p>If you didn't request this login, please ignore this email or <a href="${process.env.SUPPORT_URL || 'mailto:support@aazhi.com'}">contact support</a>.</p>
          
          <p style="margin-top: 32px;">Warm regards,<br>
          <strong>The Aazhi Team</strong> ❤️</p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} Aazhi. All rights reserved.</p>
          <p>Made with ❤️ for little ones</p>
          <p><a href="${process.env.UNSUBSCRIBE_URL || '#'}" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate order confirmation email HTML
const generateOrderConfirmationHTML = (orderDetails, customerName) => {
  const generateItemsTable = (items) => {
    if (!items || items.length === 0) return '<p>No items in order</p>';
    
    let tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #667eea; color: white;">
            <th style="padding: 12px; text-align: left;">Product</th>
            <th style="padding: 12px; text-align: center;">Quantity</th>
            <th style="padding: 12px; text-align: right;">Price</th>
            <th style="padding: 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    for (const item of items) {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      tableHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px;">${escapeHtml(item.name || 'Product')}</td>
          <td style="padding: 12px; text-align: center;">${item.quantity || 0}</td>
          <td style="padding: 12px; text-align: right;">₹${(item.price || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 12px; text-align: right;">₹${itemTotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }
    
    // Add shipping if exists
    if (orderDetails.shippingCost) {
      tableHtml += `
        <tr style="border-top: 2px solid #e2e8f0;">
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Shipping Cost</strong></td>
          <td style="padding: 12px; text-align: right;">₹${orderDetails.shippingCost.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }
    
    // Add tax if exists
    if (orderDetails.tax) {
      tableHtml += `
        <tr>
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Tax</strong></td>
          <td style="padding: 12px; text-align: right;">₹${orderDetails.tax.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }
    
    tableHtml += `
        <tr style="background-color: #f7f9fc; font-weight: bold;">
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Grand Total</strong></td>
          <td style="padding: 12px; text-align: right;"><strong>₹${orderDetails.total.toLocaleString('en-IN')}</strong></td>
        </tr>
      </tbody>
      </table>
    `;
    
    return tableHtml;
  };
  
  const orderDate = orderDetails.createdAt 
    ? new Date(orderDetails.createdAt).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : new Date().toLocaleDateString('en-IN');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Aazhi</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 32px 20px;
          text-align: center;
        }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 32px; }
        .order-details {
          background: #f7f9fc;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .shipping-box {
          background: #f7f9fc;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .tracking-btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 24px;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Thank You for Your Order! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${escapeHtml(customerName)}!</h2>
          <p>Your order has been successfully placed and is being processed.</p>
          
          <div class="order-details">
            <h3>📋 Order Summary</h3>
            <p><strong>Order Number:</strong> #${escapeHtml(orderDetails.orderNumber)}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Payment Method:</strong> ${escapeHtml(orderDetails.paymentMethod?.toUpperCase() || 'N/A')}</p>
            <p><strong>Payment Status:</strong> ${orderDetails.paymentStatus || 'Pending'}</p>
          </div>
          
          ${generateItemsTable(orderDetails.items)}
          
          <div class="shipping-box">
            <h3>🚚 Shipping Address</h3>
            <p>
              <strong>${escapeHtml(orderDetails.shippingAddress?.fullName || 'N/A')}</strong><br>
              ${escapeHtml(orderDetails.shippingAddress?.address || 'N/A')}<br>
              ${escapeHtml(orderDetails.shippingAddress?.city || 'N/A')}, ${escapeHtml(orderDetails.shippingAddress?.state || 'N/A')} - ${escapeHtml(orderDetails.shippingAddress?.pincode || 'N/A')}<br>
              📞 Phone: ${escapeHtml(orderDetails.shippingAddress?.phone || 'N/A')}
            </p>
          </div>
          
          <p>We'll send you another email once your order is shipped.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.ORDER_TRACKING_URL || '#'}/${orderDetails.orderNumber}" class="tracking-btn">
              Track Your Order
            </a>
          </div>
          
          <p>Need help? Contact our <a href="${process.env.SUPPORT_URL || 'mailto:support@aazhi.com'}">customer support</a>.</p>
          
          <p>Thank you for choosing Aazhi! ❤️</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Aazhi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send OTP Email with retry logic
export const sendOTPEmail = async (email, otp, userName, retryCount = 0) => {
  try {
    // Validate email
    if (!email || !isValidEmail(email)) {
      console.error('❌ Invalid email address:', email);
      return { success: false, error: 'INVALID_EMAIL' };
    }
    
    // Rate limiting check
    const rateLimit = checkRateLimit(`otp:${email}`, 3600000, 3);
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit exceeded for ${email}`);
      return { 
        success: false, 
        error: 'RATE_LIMIT_EXCEEDED',
        waitTime: rateLimit.waitTime 
      };
    }
    
    const html = generateOTPEmailHTML(otp, userName);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: '🔐 Your Aazhi Login OTP',
      html: html,
      headers: {
        'X-Entity-Ref-ID': `otp-${Date.now()}`,
      },
    });
    
    if (error) {
      console.error(`❌ Resend error (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for certain errors
      if (retryCount < MAX_RETRIES && (error.statusCode === 429 || error.statusCode === 500)) {
        console.log(`🔄 Retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS);
        return sendOTPEmail(email, otp, userName, retryCount + 1);
      }
      
      return { success: false, error: error.message };
    }
    
    console.log(`✅ OTP email sent to: ${email}, ID: ${data.id}`);
    return { success: true, id: data.id };
    
  } catch (error) {
    console.error('❌ OTP email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send Order Confirmation Email with retry logic
export const sendOrderConfirmation = async (orderDetails, customerEmail, customerName, retryCount = 0) => {
  try {
    // Validate inputs
    if (!customerEmail || !isValidEmail(customerEmail)) {
      console.error('❌ Invalid customer email:', customerEmail);
      return { success: false, error: 'INVALID_EMAIL' };
    }
    
    if (!orderDetails || !orderDetails.orderNumber) {
      console.error('❌ Invalid order details');
      return { success: false, error: 'INVALID_ORDER' };
    }
    
    // Rate limiting check
    const rateLimit = checkRateLimit(`order:${customerEmail}`, 3600000, 5);
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit exceeded for ${customerEmail}`);
      return { 
        success: false, 
        error: 'RATE_LIMIT_EXCEEDED',
        waitTime: rateLimit.waitTime 
      };
    }
    
    console.log(`📧 Sending order confirmation email to: ${customerEmail}`);
    
    const html = generateOrderConfirmationHTML(orderDetails, customerName);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [customerEmail],
      subject: `🎉 Order Confirmation #${orderDetails.orderNumber} - Aazhi`,
      html: html,
      headers: {
        'X-Entity-Ref-ID': `order-${orderDetails.orderNumber}`,
      },
    });
    
    if (error) {
      console.error(`❌ Order email error (attempt ${retryCount + 1}):`, error);
      
      // Retry logic
      if (retryCount < MAX_RETRIES && (error.statusCode === 429 || error.statusCode === 500)) {
        console.log(`🔄 Retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS);
        return sendOrderConfirmation(orderDetails, customerEmail, customerName, retryCount + 1);
      }
      
      return { success: false, error: error.message };
    }
    
    console.log(`✅ Order confirmation sent to: ${customerEmail}, ID: ${data.id}`);
    return { success: true, id: data.id };
    
  } catch (error) {
    console.error('❌ Order email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Generic function to send any email
export const sendCustomEmail = async (to, subject, htmlContent, options = {}) => {
  try {
    if (!to || !isValidEmail(to)) {
      return { success: false, error: 'INVALID_EMAIL' };
    }
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      html: htmlContent,
      ...options,
    });
    
    if (error) throw error;
    
    console.log(`✅ Email sent to: ${to}, ID: ${data.id}`);
    return { success: true, id: data.id };
    
  } catch (error) {
    console.error('❌ Custom email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Bulk email sending (with rate limiting)
export const sendBulkEmails = async (emailsWithContent) => {
  const results = [];
  const batchSize = 10; // Send 10 emails at a time
  const delayBetweenBatches = 1000; // 1 second delay between batches
  
  for (let i = 0; i < emailsWithContent.length; i += batchSize) {
    const batch = emailsWithContent.slice(i, i + batchSize);
    const batchPromises = batch.map(async ({ email, subject, html }) => {
      return await sendCustomEmail(email, subject, html);
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches to respect rate limits
    if (i + batchSize < emailsWithContent.length) {
      await delay(delayBetweenBatches);
    }
  }
  
  return results;
};

// Health check function
export const checkEmailServiceHealth = async () => {
  try {
    // Try to get account info (if Resend provides this endpoint)
    const startTime = Date.now();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ['test@resend.dev'], // Resend's test email
      subject: 'Health Check',
      html: '<p>Health check</p>',
    });
    
    const responseTime = Date.now() - startTime;
    
    if (error) throw error;
    
    return {
      healthy: true,
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV,
      fromEmail: FROM_EMAIL,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      environment: process.env.NODE_ENV,
    };
  }
};

// Export rate limiter for use in routes
export const getRateLimitStatus = (email) => {
  const otpLimit = checkRateLimit(`otp:${email}`, 3600000, 3);
  const orderLimit = checkRateLimit(`order:${email}`, 3600000, 5);
  
  return {
    otp: otpLimit,
    order: orderLimit,
  };
};

export { resend };
