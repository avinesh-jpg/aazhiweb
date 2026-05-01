import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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

// Generate OTP email HTML (same as before)
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
        .otp-code span { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2c3e50; font-family: monospace; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
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
          <p style="margin-top: 20px;">Thank you,<br><strong>The Aazhi Team</strong> ❤️</p>
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

// Send OTP via Email (Now using Resend)
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const html = generateOTPEmailHTML(otp, userName);
    
    const { data, error } = await resend.emails.send({
      from: 'Aazhi <onboarding@resend.dev>', // You can change this later
      to: [email],
      subject: '🔐 Your Aazhi Login OTP',
      html: html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log(`✅ OTP email sent to: ${email}, ID: ${data.id}`);
    return true;
  } catch (error) {
    console.error('❌ OTP email error:', error.message);
    return false;
  }
};

// Generate order items table HTML (keep your existing functions)
const generateItemsTable = (items) => {
  // ... keep your existing generateItemsTable function
  if (!items || items.length === 0) return '<p>No items</p>';
  
  let tableHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #2c3e50; color: white;">
          <th style="padding: 12px;">Product</th>
          <th style="padding: 12px;">Quantity</th>
          <th style="padding: 12px;">Price</th>
          <th style="padding: 12px;">Total</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    tableHtml += `
      <tr>
        <td style="padding: 10px;">${escapeHtml(item.name)}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">₹${item.price.toLocaleString()}</td>
        <td style="padding: 10px; text-align: right;">₹${itemTotal.toLocaleString()}</td>
      </tr>
    `;
  }
  
  tableHtml += `</tbody></table>`;
  return tableHtml;
};

// Send order confirmation email (simplified for Resend)
export const sendOrderConfirmation = async (orderDetails, customerEmail, customerName) => {
  try {
    console.log(`📧 Sending order confirmation email to: ${customerEmail}`);
    
    const itemsTable = generateItemsTable(orderDetails.items);
    const orderDate = new Date(orderDetails.createdAt).toLocaleDateString('en-IN');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Confirmation - Aazhi</title>
      </head>
      <body>
        <h2>Hello ${escapeHtml(customerName)}!</h2>
        <p>Thank you for your order! Here are your order details:</p>
        
        <h3>Order #${orderDetails.orderNumber}</h3>
        <p><strong>Order Date:</strong> ${orderDate}</p>
        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod.toUpperCase()}</p>
        <p><strong>Total Amount:</strong> ₹${orderDetails.total.toLocaleString()}</p>
        
        <h3>Order Items:</h3>
        ${itemsTable}
        
        <h3>Shipping Address:</h3>
        <p>
          ${escapeHtml(orderDetails.shippingAddress.fullName)}<br>
          ${escapeHtml(orderDetails.shippingAddress.address)}<br>
          ${escapeHtml(orderDetails.shippingAddress.city)}, ${escapeHtml(orderDetails.shippingAddress.state)} - ${escapeHtml(orderDetails.shippingAddress.pincode)}<br>
          Phone: ${escapeHtml(orderDetails.shippingAddress.phone)}
        </p>
        
        <p>We'll notify you once your order is shipped.</p>
        <p>Thank you for choosing Aazhi! ❤️</p>
      </body>
      </html>
    `;
    
    const { data, error } = await resend.emails.send({
      from: 'Aazhi <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `🎉 Order Confirmation #${orderDetails.orderNumber} - Aazhi`,
      html: html,
    });

    if (error) {
      console.error('❌ Order email error:', error);
      return false;
    }

    console.log(`✅ Order confirmation sent to: ${customerEmail}, ID: ${data.id}`);
    return true;
  } catch (error) {
    console.error('❌ Order email error:', error.message);
    return false;
  }
};

export { resend };