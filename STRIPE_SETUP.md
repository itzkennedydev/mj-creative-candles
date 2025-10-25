# Stripe Payment Integration Setup

## Overview
Stripe payment integration has been successfully set up for your Stitch Please application. The integration includes:

- Secure payment processing with Stripe Elements
- Payment intent creation and confirmation
- Webhook handling for payment status updates
- Order status management

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...  # Your Stripe webhook secret
```

## Getting Your Stripe API Keys

1. **Create a Stripe Account**: Go to [https://stripe.com](https://stripe.com) and create an account
2. **Get API Keys**: 
   - Go to [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
   - Copy your **Publishable key** (starts with `pk_test_` for test mode)
   - Copy your **Secret key** (starts with `sk_test_` for test mode)

3. **Set up Webhooks**:
   - Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Copy the webhook signing secret (starts with `whsec_`)

## How It Works

1. **Customer fills out checkout form** → Order is created in database with "pending" status
2. **Payment intent is created** → Stripe generates a client secret
3. **Customer enters payment details** → Stripe Elements handles secure card input
4. **Payment is processed** → Stripe confirms payment
5. **Webhook updates order** → Order status changes to "paid"

## Files Added/Modified

### New Files:
- `src/lib/stripe.ts` - Stripe configuration and utilities
- `src/app/api/stripe/create-payment-intent/route.ts` - Creates payment intents
- `src/app/api/stripe/webhook/route.ts` - Handles Stripe webhooks
- `src/components/stripe/stripe-provider.tsx` - Stripe Elements provider
- `src/components/stripe/payment-form.tsx` - Payment form component

### Modified Files:
- `src/env.js` - Added Stripe environment variables
- `src/components/shop/checkout-form.tsx` - Integrated Stripe payment flow
- `src/app/api/orders/[id]/route.ts` - Added PATCH method for payment updates
- `src/lib/order-types.ts` - Added payment-related fields

## Testing

1. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

2. Test the complete flow:
   - Add items to cart
   - Go to checkout
   - Fill out customer information
   - Enter test card details
   - Complete payment

## Production Deployment

1. **Switch to live keys**: Replace test keys with live keys in production
2. **Update webhook URL**: Point to your production domain
3. **Test thoroughly**: Ensure all payment flows work correctly

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Webhook signatures are verified for security
- Payment data is handled securely by Stripe

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
