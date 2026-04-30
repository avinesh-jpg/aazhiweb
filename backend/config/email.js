import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// CRITICAL: Force Node.js to use IPv4 first (fix for ENETUNREACH error)
dns.setDefaultResultOrder('ipv4first');

// Gmail's IPv4 address (bypasses DNS resolution issues)
// This is more reliable than relying on family:4 which some environments ignore
const GMAIL_SMTP_IPV4 = '142.250.141.108'; // smtp.gmail.com IPv4 address

// Create email transporter with IPv4 fix
const transporter = nodemailer.createTransport({
  // OPTION 1: Use IPv4 address directly (MOST RELIABLE on Render)
  host: GMAIL_SMTP_IPV4,
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // CRITICAL: This validates the certificate against smtp.gmail.com
    servername: 'smtp.gmail.com',
    ciphers: 'SSLv3'
  },
  // Connection settings for Render
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  // Pool connections for better performance
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// ==================== OTP EMAIL FUNCTIONS ====================

// Generate OTP email HTML
const generateOTPEmailHTML = (otp, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email OTP - Aazhi</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
        .content { padding: 30px; }
        .otp-code { background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .otp-code span { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2c3e50; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
        .button { display: inline-block; padding: 10px 20px; background: #2c3e50; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Aazhi ✨</h1>
          <p>Email Verification</p>
        </div>
        <div class="content">
          <h2>Hello ${escapeHtml(userName) || 'Valued Customer'}!</h2>
          <p>You requested to login to your Aazhi account. Please use the following OTP to complete your login:</p>
          <div class="otp-code">
            <span>${otp}</span>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 20px;">Thank you,<br><strong>The aazhi Team</strong> ❤️</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Aazhi. All rights reserved.</p>
          <p>Made with ❤️ for little ones</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send OTP via Email
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    // Check if credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials missing in environment variables');
      return false;
    }

    console.log(`📧 Attempting to send OTP to: ${email}`);
    
    const html = generateOTPEmailHTML(otp, userName);
    
    const mailOptions = {
      from: `"Aazhi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your Aazhi Login OTP',
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to: ${email}, Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ OTP email error:', error.message);
    console.error('❌ Error code:', error.code);
    
    if (error.code === 'ENETUNREACH') {
      console.error('⚠️ Network unreachable - This should be fixed by using IPv4 address directly');
      console.error('⚠️ If error persists, check if Render is blocking outbound SMTP');
    } else if (error.message.includes('Invalid login') || error.message.includes('535')) {
      console.error('⚠️ Gmail authentication failed');
      console.error('⚠️ Make sure you generated an App Password (not your regular password)');
      console.error('⚠️ Generate one at: https://myaccount.google.com/apppasswords');
      console.error('⚠️ Your .env file should have: EMAIL_PASS="xxxx xxxx xxxx xxxx"');
    } else if (error.message.includes('connect ETIMEDOUT')) {
      console.error('⚠️ Connection timeout - Render might be blocking port 587');
      console.error('⚠️ Try using port 465 instead (change secure to true)');
    }
    
    return false;
  }
};

// ==================== ORDER CONFIRMATION EMAIL FUNCTIONS ====================

// Generate order items table HTML
const generateItemsTable = (items) => {
  if (!items || items.length === 0) return '<p>No items</p>';
  
  let tableHtml = `
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
      <thead>
        <tr style="background-color: #2c3e50; color: white;">
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Product</th>
          <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Quantity</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Price</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    tableHtml += `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(item.name)}</td>
        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.price.toLocaleString()}</td>
        <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${itemTotal.toLocaleString()}</td>
      </tr>
    `;
  }
  
  tableHtml += `
      </tbody>
    </table>
  `;
  
  return tableHtml;
};

// Generate order confirmation email HTML
const generateOrderEmailHTML = (orderDetails, customerName) => {
  const itemsTable = generateItemsTable(orderDetails.items);
  
  const shippingAddressHtml = `
    <strong>${escapeHtml(orderDetails.shippingAddress.fullName)}</strong><br>
    ${escapeHtml(orderDetails.shippingAddress.address)}<br>
    ${escapeHtml(orderDetails.shippingAddress.city)}, ${escapeHtml(orderDetails.shippingAddress.state)} - ${escapeHtml(orderDetails.shippingAddress.pincode)}<br>
    Phone: ${escapeHtml(orderDetails.shippingAddress.phone)}
  `;
  
  const orderDate = new Date(orderDetails.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Aazhi</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: 2px;
        }
        .header p {
          margin: 5px 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .order-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #e9ecef;
        }
        .order-details h3 {
          margin-top: 0;
          color: #2c3e50;
        }
        .total {
          text-align: right;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #dee2e6;
        }
        .total h3 {
          font-size: 20px;
          color: #2c3e50;
          margin: 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #dee2e6;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #2c3e50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
        }
        .success-badge {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        @media only screen and (max-width: 480px) {
          .content {
            padding: 15px;
          }
          table {
            font-size: 12px;
          }
          th, td {
            padding: 6px !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Aazhi ✨</h1>
          <p>Where Little Dreams Take Flight</p>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="success-badge">✓ ORDER CONFIRMED</span>
          </div>
          
          <h2>Hello ${escapeHtml(customerName)}!</h2>
          <p>Thank you for shopping with <strong>Aazhi</strong>. Your order has been received and is being processed with care.</p>
          
          <div class="order-details">
            <h3>📦 Order #${orderDetails.orderNumber}</h3>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod.toUpperCase()}</p>
            <p><strong>Payment Status:</strong> ${orderDetails.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}</p>
            
            <h3 style="margin-top: 20px;">🛍️ Order Items:</h3>
            ${itemsTable}
            
            <div class="total">
              <p><strong>Subtotal:</strong> ₹${orderDetails.subtotal.toLocaleString()}</p>
              <p><strong>Shipping:</strong> ${orderDetails.shipping === 0 ? 'FREE' : `₹${orderDetails.shipping.toLocaleString()}`}</p>
              <h3>Total Amount: ₹${orderDetails.total.toLocaleString()}</h3>
            </div>
          </div>
          
          <div class="order-details">
            <h3>📍 Shipping Address</h3>
            <p>${shippingAddressHtml}</p>
          </div>
          
          <div class="order-details">
            <h3>📞 Need Help?</h3>
            <p>If you have any questions about your order, please contact us:</p>
            <p>📧 Email: support@Aazhi.com<br>
            📱 Phone: +91 12345 67890</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/orders" class="button">Track Your Order</a>
          </div>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            We'll notify you once your order is shipped. Thank you for choosing Aazhi!
          </p>
          
          <p style="margin-top: 10px;">
            With love,<br>
            <strong>The Aazhi Team</strong> ❤️
          </p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Aazhi. All rights reserved.</p>
          <p>Made with ❤️ for little ones</p>
          <p style="margin-top: 10px;">
            <a href="#" style="color: #6c757d; text-decoration: none;">Privacy Policy</a> | 
            <a href="#" style="color: #6c757d; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
export const sendOrderConfirmation = async (orderDetails, customerEmail, customerName) => {
  try {
    console.log(`📧 Sending order confirmation email to: ${customerEmail}`);
    
    const emailHtml = generateOrderEmailHTML(orderDetails, customerName);
    
    const mailOptions = {
      from: `"Aazhi" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `🎉 Order Confirmation #${orderDetails.orderNumber} - Aazhi`,
      html: emailHtml,
      replyTo: 'support@Aazhi.com'
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Order confirmation email sent successfully to: ${customerEmail}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Order confirmation email error:', error.message);
    if (error.message.includes('Invalid login')) {
      console.error('⚠️ Please check your Gmail credentials in .env file');
      console.error('⚠️ Make sure you generated an App Password (not your regular password)');
    }
    return false;
  }
};

// ==================== TEST EMAIL FUNCTION ====================

// Test email function
export const sendTestEmail = async (testEmail) => {
  try {
    await transporter.verify();
    
    const testOrder = {
      orderNumber: 'TEST-001',
      items: [
        { name: 'Test Product 1', price: 599, quantity: 2 },
        { name: 'Test Product 2', price: 399, quantity: 1 }
      ],
      subtotal: 1597,
      shipping: 0,
      total: 1597,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      shippingAddress: {
        fullName: 'Test Customer',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '9876543210'
      },
      createdAt: new Date()
    };
    
    const emailHtml = generateOrderEmailHTML(testOrder, 'Test Customer');
    
    const mailOptions = {
      from: `"Aazhi" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: 'Test Email - Aazhi Email System',
      html: emailHtml
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent to: ${testEmail}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    return false;
  }
};

// Export transporter for potential reuse
export { transporter };
