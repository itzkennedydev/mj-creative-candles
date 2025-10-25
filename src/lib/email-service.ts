import { Resend } from 'resend';
import type { Order, OrderItem } from './order-types';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY ?? 'dummy-key-for-build');

export async function sendOrderConfirmationEmail(order: Order) {
  try {
    // Skip email sending during build time or if no API key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.log('Skipping email sending - no valid Resend API key');
      return true;
    }

    // Customer email
    const customerEmailHtml = generateCustomerEmailTemplate(order);
    
    await resend.emails.send({
      from: 'Stitch Please <orders@stitchpleaseqc.com>',
      to: [order.customer.email],
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: customerEmailHtml
    });

    // Owner email
    const ownerEmailHtml = generateOwnerEmailTemplate(order);
    
    await resend.emails.send({
      from: 'Stitch Please Orders <orders@stitchpleaseqc.com>',
      to: ['pleasestitch18@gmail.com'],
      subject: `New Order Received - ${order.orderNumber}`,
      html: ownerEmailHtml
    });

    console.log('Emails sent successfully via Resend');
    return true;
  } catch (error) {
    console.error('Error sending emails via Resend:', error);
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
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.log('Skipping pickup email sending - no valid Resend API key');
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
    
    await resend.emails.send({
      from: 'Stitch Please <orders@stitchpleaseqc.com>',
      to: [customerEmail],
      subject: `Your Order is Ready for Pickup - ${orderNumber}`,
      html: pickupEmailHtml
    });

    console.log('Pickup ready email sent successfully via Resend');
    return true;
  } catch (error) {
    console.error('Error sending pickup ready email via Resend:', error);
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
