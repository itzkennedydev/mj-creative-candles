import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { env } from "~/env.js";
import { getAuthorizedEmails } from "~/lib/admin-emails-db";

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Skip email sending during build time or if no API key
    if (!env.RESEND_API_KEY || env.RESEND_API_KEY === "dummy-key-for-build") {
      console.log("Skipping coming soon email - no valid Resend API key");
      return NextResponse.json({ success: true });
    }

    // Get admin emails from database
    const adminEmails = await getAuthorizedEmails();
    const adminEmailAddresses = adminEmails.map((admin) => admin.email);

    if (adminEmailAddresses.length === 0) {
      console.warn("No admin emails found in database, using fallback");
      adminEmailAddresses.push(
        "pleasestitch18@gmail.com",
        "itskennedy.dev@gmail.com"
      );
    }

    // Send notification email to admin
    const adminNotificationHtml = generateAdminNotificationTemplate(email);

    await resend.emails.send({
      from: "MJ Creative Candles <notifications@mjcreativecandles.com>",
      to: adminEmailAddresses,
      subject: `New Coming Soon Notification Request: ${email}`,
      html: adminNotificationHtml,
    });

    console.log(`✅ Coming soon notification sent for ${email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process coming soon notification:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}

function generateAdminNotificationTemplate(email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Coming Soon Notification Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1d1d1f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; border: 2px solid #1d1d1f; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .label { font-weight: bold; color: #1d1d1f; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Coming Soon Notification Request</h1>
          <p>Someone wants to be notified when you launch</p>
        </div>
        
        <div class="content">
          <div class="info-box">
            <div style="margin-bottom: 15px;">
              <span class="label">Email:</span><br>
              ${email}
            </div>
            <div style="margin-bottom: 15px;">
              <span class="label">Requested At:</span><br>
              ${new Date().toLocaleString()}
            </div>
          </div>
          
          <p>This person has requested to be notified when MJ Creative Candles launches.</p>
          <p><strong>Action:</strong> Make sure to email them at <a href="mailto:${email}">${email}</a> when the site goes live!</p>
        </div>
        
        <div class="footer">
          <p>© 2025 MJ Creative Candles. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
