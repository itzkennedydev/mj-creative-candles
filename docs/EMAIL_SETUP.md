# Email Setup Guide

## Resend API Setup

To enable email notifications, you need to set up a Resend API key:

### 1. Create Resend Account
- Go to [resend.com](https://resend.com)
- Sign up for a free account
- Verify your email address

### 2. Get API Key
- Log into your Resend dashboard
- Go to API Keys section
- Create a new API key
- Copy the API key (starts with `re_`)

### 3. Add Domain (Optional but Recommended)
- In Resend dashboard, go to Domains
- Add your domain (e.g., `itskennedy.dev`)
- Follow DNS setup instructions for better deliverability

### 4. Update Environment Variables
Replace `your_resend_api_key_here` in `.env.local` with your actual API key:

```
RESEND_API_KEY="re_your_actual_api_key"
```

### 5. Test Email Functionality
Once configured, emails will be automatically sent when:
- A customer places an order (confirmation email to customer)
- A new order is received (notification email to owner)

## Email Templates

### Customer Email
- Order confirmation with details
- Pickup instructions
- Contact information

### Owner Email
- New order notification
- Customer details
- Order summary
- Action items for pickup arrangement

## Benefits of Resend

- **Better deliverability** - Professional email service
- **Easy setup** - No complex SMTP configuration
- **Reliable** - Built for transactional emails
- **Analytics** - Track email delivery and opens
- **Free tier** - 3,000 emails/month free

## Troubleshooting

If emails aren't sending:
1. Check that the Resend API key is correct
2. Verify the API key has proper permissions
3. Check server logs for email errors
4. Ensure environment variables are loaded correctly
5. Check Resend dashboard for delivery status
