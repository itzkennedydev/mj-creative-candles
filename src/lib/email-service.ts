import Mailgun from 'mailgun.js';
import type { Order, OrderItem } from './order-types';
import { env } from '~/env.js';

// Initialize Mailgun
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: String(env.MAILGUN_API_KEY),
  url: 'https://api.mailgun.net'
});

export async function sendVerificationCodeEmail(email: string, code: string) {
  try {
    const verificationEmailHtml = generateVerificationEmailTemplate(code);

    await mg.messages.create('stitchpleaseqc.com', {
      from: 'Stitch Please Admin <admin@stitchpleaseqc.com>',
      to: [email],
      subject: 'Your Stitch Please Admin Verification Code',
      html: verificationEmailHtml
    });

    console.log(`✅ Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Fallback: log the code for development
    console.log(`📧 [FALLBACK] Verification code for ${email}: ${code}`);
    console.log(`📧 [FALLBACK] Email sending failed, but code is available above`);
    return true; // Don't fail the request, just log the code
  }
}

function generateVerificationEmailTemplate(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0A5565; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code-box { background: white; border: 2px solid #0A5565; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #0A5565; letter-spacing: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Stitch Please Admin</h1>
          <p>Verification Code</p>
        </div>
        <div class="content">
          <h2>Your Verification Code</h2>
          <p>Use this code to sign in to your Stitch Please admin account:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 Stitch Please. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendOrderConfirmationEmail(order: Order) {
  try {
    // Skip email sending during build time or if no API key
    if (!env.MAILGUN_API_KEY || env.MAILGUN_API_KEY === 'dummy-key-for-build') {
      console.log('Skipping email sending - no valid Mailgun API key');
      return true;
    }

    // Customer email
    const customerEmailHtml = generateCustomerEmailTemplate(order);
    
    await mg.messages.create('stitchpleaseqc.com', {
      from: 'Stitch Please <orders@stitchpleaseqc.com>',
      to: [order.customer.email],
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: customerEmailHtml
    });

    // Owner email
    const ownerEmailHtml = generateOwnerEmailTemplate(order);
    
    await mg.messages.create('stitchpleaseqc.com', {
      from: 'Stitch Please Orders <orders@stitchpleaseqc.com>',
      to: ['pleasestitch18@gmail.com'],
      subject: `New Order Received - ${order.orderNumber}`,
      html: ownerEmailHtml
    });

    console.log('Email notifications sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending emails via Mailgun:', error);
    return false;
  }
}

function generateCustomerEmailTemplate(order: Order): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #74CADC; color: #0A5565; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #0A5565; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${order.customer.firstName}!</h2>
          <p>Your order has been received and is being processed. We'll contact you soon to arrange pickup.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            
            <h4>Items Ordered:</h4>
            ${order.items.map(item => `
              <div class="item">
                <strong>${item.productName}</strong>
                ${item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}
                ${item.selectedColor ? ` - Color: ${item.selectedColor}` : ''}
                <br>Quantity: ${item.quantity} × $${item.productPrice.toFixed(2)} = $${(item.quantity * item.productPrice).toFixed(2)}
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #74CADC;">
              <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
              <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
              <p><strong>Pickup:</strong> Free</p>
              <p class="total"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            </div>
            
            <p><strong>Payment Method:</strong> Online Payment (Credit/Debit Card)</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>📞 Next Steps</h4>
            <p>We'll contact you at <strong>${order.customer.phone}</strong> to arrange a convenient pickup time once your order is ready.</p>
            <p><strong>Our Phone:</strong> (309) 373-6017</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Stitch Please!</p>
          <p>Questions? Reply to this email or call us at (309) 373-6017.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOwnerEmailTemplate(order: Order): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - ${order.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0A5565; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #0A5565; }
        .customer-info { background: #e8f5e8; padding: 15px; border-radius: 8px; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🆕 New Order Received</h1>
          <p>Order #${order.orderNumber}</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            <h3>⚠️ Action Required</h3>
            <p>Contact customer to arrange pickup time.</p>
          </div>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
          </div>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString()}</p>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            
            <h4>Items Ordered:</h4>
            ${order.items.map(item => `
              <div class="item">
                <strong>${item.productName}</strong>
                ${item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}
                ${item.selectedColor ? ` - Color: ${item.selectedColor}` : ''}
                <br>Quantity: ${item.quantity} × $${item.productPrice.toFixed(2)} = $${(item.quantity * item.productPrice).toFixed(2)}
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #0A5565;">
              <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
              <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
              <p><strong>Pickup:</strong> Free</p>
              <p class="total"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            </div>
            
            <p><strong>Payment Method:</strong> Online Payment (Credit/Debit Card)</p>
            ${order.notes ? `<p><strong>Customer Notes:</strong> ${order.notes}</p>` : ''}
          </div>
          
          <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>📋 Next Steps</h4>
            <ol>
              <li>Review order details</li>
              <li>Contact customer at ${order.customer.phone}</li>
              <li>Arrange pickup time</li>
              <li>Update order status in admin panel</li>
            </ol>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>View full order details in your admin panel</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendPickupReadyEmail({
  customerName,
  customerEmail,
  orderNumber,
  pickupTime,
  customMessage,
  items,
  total
}: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  pickupTime: Date;
  customMessage: string;
  items: OrderItem[];
  total: number;
}) {
  try {
    // Skip email sending during build time or if no API key
    if (!env.MAILGUN_API_KEY || env.MAILGUN_API_KEY === 'dummy-key-for-build') {
      console.log('Skipping pickup email sending - no valid Mailgun API key');
      return true;
    }

    const pickupEmailHtml = generatePickupReadyEmailTemplate({
      customerName,
      orderNumber,
      pickupTime,
      customMessage,
      items,
      total
    });
    
    await mg.messages.create('stitchpleaseqc.com', {
      from: 'Stitch Please <orders@stitchpleaseqc.com>',
      to: [customerEmail],
      subject: `Your Order is Ready for Pickup - ${orderNumber}`,
      html: pickupEmailHtml
    });

    console.log('Pickup ready email sent successfully via Mailgun');
    return true;
  } catch (error) {
    console.error('Error sending pickup ready email via Mailgun:', error);
    return false;
  }
}

function generatePickupReadyEmailTemplate({
  customerName,
  orderNumber,
  pickupTime,
  customMessage,
  items,
  total
}: {
  customerName: string;
  orderNumber: string;
  pickupTime: Date;
  customMessage: string;
  items: OrderItem[];
  total: number;
}): string {
  const formattedPickupTime = pickupTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Ready for Pickup</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #74CADC; color: #0A5565; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #0A5565; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .pickup-time { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .custom-message { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .urgent { background: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Order is Ready!</h1>
          <p>Time to pick up your custom items</p>
        </div>
        
        <div class="content">
          <h2>Hello ${customerName}!</h2>
          <p>Great news! Your order has been completed and is ready for pickup.</p>
          
          <div class="pickup-time">
            <h3>📅 Scheduled Pickup Time</h3>
            <p style="font-size: 24px; font-weight: bold; color: #0A5565; margin: 10px 0;">
              ${formattedPickupTime}
            </p>
            <p style="color: #666; font-size: 14px;">
              Please arrive at the scheduled time. If you need to reschedule, please contact us as soon as possible.
            </p>
          </div>

          ${customMessage ? `
            <div class="custom-message">
              <h4>📝 Special Instructions</h4>
              <p>${customMessage}</p>
            </div>
          ` : ''}

          <div class="urgent">
            <h3>⚠️ Important Pickup Information</h3>
            <ul>
              <li><strong>Check your items</strong> - Please inspect your order before leaving</li>
              <li><strong>Contact us</strong> - Call (309) 373-6017 if you have any questions</li>
            </ul>
          </div>
          
          <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            
            <h4>Items Ready for Pickup:</h4>
            ${items.map(item => `
              <div class="item">
                <strong>${item.productName}</strong>
                ${item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}
                ${item.selectedColor ? ` - Color: ${item.selectedColor}` : ''}
                <br>Quantity: ${item.quantity} × $${item.productPrice.toFixed(2)} = $${(item.quantity * item.productPrice).toFixed(2)}
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #74CADC;">
              <p class="total"><strong>Total Paid: $${total.toFixed(2)}</strong></p>
            </div>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>📍 Pickup Location</h4>
            <p><strong>Stitch Please</strong><br>
            415 13th St<br>
            Moline, IL 61265</p>
            <p><strong>Phone:</strong> (309) 373-6017</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Stitch Please!</p>
          <p>Questions? Call us at (309) 373-6017 or reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Status-specific email functions
export async function sendStatusUpdateEmail({
  customerName,
  customerEmail,
  orderNumber,
  status,
  items,
  total
}: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  total: number;
}) {
  try {
    // Skip email sending during build time or if no API key
    if (!env.MAILGUN_API_KEY || env.MAILGUN_API_KEY === 'dummy-key-for-build') {
      console.log('Skipping status email sending - no valid Mailgun API key');
      return true;
    }

    let emailHtml: string;
    let subject: string;

    switch (status) {
      case 'processing':
        emailHtml = generateProcessingEmailTemplate({ customerName, orderNumber, items, total });
        subject = `Order Processing Started - ${orderNumber}`;
        break;
      case 'delivered':
        emailHtml = generateDeliveredEmailTemplate({ customerName, orderNumber, items, total });
        subject = `Thank You! Order Delivered - ${orderNumber}`;
        break;
      case 'cancelled':
        emailHtml = generateCancelledEmailTemplate({ customerName, orderNumber, items, total });
        subject = `Order Cancelled - ${orderNumber}`;
        break;
      default:
        return true; // No email for other statuses
    }

    await mg.messages.create('stitchpleaseqc.com', {
      from: 'Stitch Please <orders@stitchpleaseqc.com>',
      to: [customerEmail],
      subject,
      html: emailHtml
    });

    console.log(`${status} email sent successfully via Mailgun`);
    return true;
  } catch (error) {
    console.error(`Error sending ${status} email via Mailgun:`, error);
    return false;
  }
}

function generateProcessingEmailTemplate({
  customerName,
  orderNumber,
  items,
  total
}: {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Processing</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #2196F3; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .processing { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Processing Started</h1>
          <p>Your order is now being worked on</p>
        </div>
        
        <div class="content">
          <h2>Hello ${customerName}!</h2>
          <p>Great news! We've started working on your order and it's now in our production queue.</p>
          
          <div class="processing">
            <h3>What's Happening Now</h3>
            <p>Our team is carefully crafting your custom items. We'll keep you updated on the progress and contact you as soon as everything is ready for pickup.</p>
          </div>
          
          <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            
            <h4>Items Being Processed:</h4>
            ${items.map(item => `
              <div class="item">
                <strong>${item.productName}</strong>
                ${item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}
                ${item.selectedColor ? ` - Color: ${item.selectedColor}` : ''}
                <br>Quantity: ${item.quantity} × $${item.productPrice.toFixed(2)} = $${(item.quantity * item.productPrice).toFixed(2)}
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #2196F3;">
              <p class="total"><strong>Total: $${total.toFixed(2)}</strong></p>
            </div>
          </div>
          
          <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Questions?</h4>
            <p>If you have any questions about your order, feel free to contact us at <strong>(309) 373-6017</strong> or reply to this email.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Stitch Please!</p>
          <p>We'll be in touch soon with pickup details.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDeliveredEmailTemplate({
  customerName,
  orderNumber,
  items,
  total
}: {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered - Thank You!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #4CAF50; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .thank-you { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .review { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Thank You!</h1>
          <p>Your order has been successfully delivered</p>
        </div>
        
        <div class="content">
          <h2>Hello ${customerName}!</h2>
          <p>We hope you're absolutely thrilled with your custom items! It was our pleasure to create something special just for you.</p>
          
          <div class="thank-you">
            <h3>🙏 Thank You for Your Business!</h3>
            <p>We truly appreciate you choosing Stitch Please for your custom clothing needs. Your support means the world to us!</p>
          </div>
          
          <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            
            <h4>Items Delivered:</h4>
            ${items.map(item => `
              <div class="item">
                <strong>${item.productName}</strong>
                ${item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}
                ${item.selectedColor ? ` - Color: ${item.selectedColor}` : ''}
                <br>Quantity: ${item.quantity} × $${item.productPrice.toFixed(2)} = $${(item.quantity * item.productPrice).toFixed(2)}
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #4CAF50;">
              <p class="total"><strong>Total: $${total.toFixed(2)}</strong></p>
            </div>
          </div>
          
          <div class="review">
            <h4>⭐ We'd Love Your Feedback!</h4>
            <p>If you're happy with your order, we'd be incredibly grateful if you could share your experience with others. Word-of-mouth referrals are the best compliment we can receive!</p>
            <p>Feel free to tag us on social media or tell your friends about Stitch Please!</p>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>🔄 Need More Custom Items?</h4>
            <p>We'd love to work with you again! Visit our website or give us a call at <strong>(309) 373-6017</strong> for your next custom project.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Stitch Please!</p>
          <p>We look forward to creating more amazing pieces for you in the future.</p>
          <p>Questions? Call us at (309) 373-6017 or reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCancelledEmailTemplate({
  customerName,
  orderNumber,
  items,
  total
}: {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Cancelled</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #f44336; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .cancelled { background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .refund { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Order Cancelled</h1>
          <p>We're sorry to see you go</p>
        </div>
        
        <div class="content">
          <h2>Hello ${customerName}!</h2>
          <p>We're sorry to inform you that your order has been cancelled. We understand this may be disappointing.</p>
          
          <div class="cancelled">
            <h3>📋 Order Cancellation Details</h3>
            <p>Your order has been cancelled and will not be processed. If you have any questions about this cancellation, please don't hesitate to contact us.</p>
          </div>
          
          <div class="order-details">
            <h3>Cancelled Order Summary</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            
            <h4>Items That Were Cancelled:</h4>
            ${items.map(item => `
              <div class="item">
                <strong>${item.productName}</strong>
                ${item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}
                ${item.selectedColor ? ` - Color: ${item.selectedColor}` : ''}
                <br>Quantity: ${item.quantity} × $${item.productPrice.toFixed(2)} = $${(item.quantity * item.productPrice).toFixed(2)}
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f44336;">
              <p class="total"><strong>Total: $${total.toFixed(2)}</strong></p>
            </div>
          </div>
          
          <div class="refund">
            <h4>💳 Refund Information</h4>
            <p>If payment was processed, a full refund will be issued to your original payment method within 3-5 business days. You should see the refund appear on your statement shortly.</p>
          </div>
          
          <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>🔄 We'd Love to Work With You Again</h4>
            <p>If you change your mind or have any questions about our services, please don't hesitate to reach out. We're here to help and would love the opportunity to create something amazing for you in the future.</p>
            <p>Contact us at <strong>(309) 373-6017</strong> or reply to this email.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for considering Stitch Please!</p>
          <p>We hope to work with you again soon.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
