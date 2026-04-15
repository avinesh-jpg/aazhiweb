import emailjs from '@emailjs/browser';

// IMPORTANT: Replace these with your actual EmailJS credentials
const SERVICE_ID = 'service_g5mn0k2';  // Your EmailJS Service ID
const TEMPLATE_ID = 'template_cd9vn9e'; // Your EmailJS Template ID  
const PUBLIC_KEY = '71zIL0RwCM2tk6uQk'; // Your EmailJS Public Key

export interface OrderDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: string;
}

// Generate beautiful HTML table for items
const generateItemsTable = (items: OrderDetails['items']): string => {
  let tableHtml = `
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
      <thead>
        <tr style="background-color: #2c3e50; color: white;">
          <th style="padding: 12px; text-align: left;">Product</th>
          <th style="padding: 12px; text-align: center;">Quantity</th>
          <th style="padding: 12px; text-align: right;">Price</th>
          <th style="padding: 12px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  for (const item of items) {
    tableHtml += `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px;">${item.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">₹${item.price.toLocaleString()}</td>
        <td style="padding: 10px; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
       </tr>
    `;
  }
  
  tableHtml += `
      </tbody>
    </table>
  `;
  
  return tableHtml;
};

// Send order confirmation email to customer
export const sendOrderConfirmation = async (orderDetails: OrderDetails): Promise<boolean> => {
  try {
    // Initialize EmailJS
    emailjs.init(PUBLIC_KEY);
    
    // Generate the items table HTML
    const itemsTableHtml = generateItemsTable(orderDetails.items);
    
    // Format shipping address for email
    const shippingAddressHtml = `
      <strong>${orderDetails.shippingAddress.fullName}</strong><br>
      ${orderDetails.shippingAddress.address}<br>
      ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} - ${orderDetails.shippingAddress.pincode}<br>
      Phone: ${orderDetails.shippingAddress.phone}
    `;
    
    // Prepare email template parameters
    const templateParams = {
      to_name: orderDetails.customerName,
      to_email: orderDetails.customerEmail,
      order_id: orderDetails.orderNumber,
      order_date: orderDetails.orderDate,
      items_table: itemsTableHtml,
      subtotal: `₹${orderDetails.subtotal.toLocaleString()}`,
      shipping: orderDetails.shipping === 0 ? 'FREE' : `₹${orderDetails.shipping.toLocaleString()}`,
      total_amount: `₹${orderDetails.total.toLocaleString()}`,
      payment_method: orderDetails.paymentMethod.toUpperCase(),
      shipping_address: shippingAddressHtml,
      year: new Date().getFullYear().toString()
    };
    
    console.log('Sending email to:', orderDetails.customerEmail);
    
    // Send the email
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    
    console.log('✅ Email sent successfully to', orderDetails.customerEmail);
    console.log('Email response:', response);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};