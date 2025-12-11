# Stitch Please

A modern e-commerce platform for custom embroidery and apparel, built with Next.js 15.

**Live Site:** [stitchpleaseqc.com](https://stitchpleaseqc.com)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Features](#key-features)
- [Admin Dashboard](#admin-dashboard)
- [API Routes](#api-routes)
- [Database](#database)
- [Deployment](#deployment)
- [iOS App](#ios-app)

---

## Overview

Stitch Please is a custom embroidery business based in Moline, IL. This platform enables customers to:

- Browse and purchase custom embroidered products (beanies, apparel, spirit wear)
- Customize orders with embroidery names and special instructions
- Complete secure checkout with Stripe
- Schedule local pickup

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI, Shadcn UI |
| Database | MongoDB |
| Payments | Stripe |
| Email | Mailgun |
| Image Optimization | Sharp, Vercel Blob |
| State Management | React Query, Context API |
| Analytics | Vercel Analytics, Google Analytics |
| Hosting | Vercel |

---

## Project Structure

```
stitch_please/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── api/                # API routes
│   │   ├── shop/               # Shop & checkout pages
│   │   ├── about/              # About page
│   │   ├── contact/            # Contact page
│   │   ├── services/           # Services pages
│   │   └── sca-dashboard/      # Shared dashboard components
│   ├── components/
│   │   ├── layout/             # Header, Footer, Navigation
│   │   ├── sections/           # Homepage sections (Hero, CTA, etc.)
│   │   ├── shop/               # Product cards, checkout, cart
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── cart-context.tsx    # Shopping cart state
│   │   ├── mongodb.ts          # Database connection
│   │   ├── stripe.ts           # Stripe configuration
│   │   ├── email-service.ts    # Mailgun email templates
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── hooks/              # Custom React hooks
│   └── styles/
│       └── globals.css         # Global styles
├── public/
│   ├── products/               # Product images
│   │   ├── beanies/            # Beanie color variants
│   │   ├── mama-keepsake/      # Keepsake product images
│   │   ├── spirit-wear/        # School spirit wear
│   │   └── misc/               # Other product images
│   ├── brands/                 # Brand logos
│   ├── schools/                # School logos
│   └── ...                     # Icons, favicons, etc.
├── scripts/                    # Database seed scripts
├── docs/                       # Technical documentation
├── stitch_please_ios/          # iOS app (Swift)
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- MongoDB database
- Stripe account
- Mailgun account

### Installation

```bash
# Clone the repository
git clone https://github.com/itzkennedydev/stitch-please.git
cd stitch_please

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbo) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run typecheck` | Run TypeScript checks |
| `npm run format:write` | Format code with Prettier |

---

## Environment Variables

Create a `.env.local` file with:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mailgun
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=stitchpleaseqc.com

# App
NEXT_PUBLIC_APP_URL=https://stitchpleaseqc.com

# Admin Auth
ADMIN_JWT_SECRET=...

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-...
```

---

## Key Features

### Shop
- Product catalog with filters (Custom Orders vs Spirit Wear)
- Product detail pages with size/color selection
- Image galleries with swipe navigation
- Order notes for customization

### Checkout
- Secure Stripe checkout integration
- Real-time form validation
- Discount codes (e.g., `STITCHIT` for 15% off)
- Tax calculation
- Local pickup only

### Cart
- Persistent cart state
- Quantity adjustments
- Remove items
- Price breakdown

### Emails
- Order confirmation (customer + admin)
- Status updates (processing, ready for pickup, delivered)
- Newsletter subscription
- Abandoned cart recovery

---

## Admin Dashboard

Access at `/admin` with email verification.

### Features
- **Orders**: View, update status, send pickup notifications
- **Products**: Add, edit, delete products with image uploads
- **Customers**: View customer list and order history
- **Analytics**: Sales charts, order trends
- **Settings**: Tax rate, pickup instructions

### Admin Authentication
1. Enter authorized email
2. Receive 6-digit verification code via email
3. Enter code to access dashboard
4. Sessions expire after 24 hours

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List all products |
| `/api/products/[id]` | GET | Get single product |
| `/api/orders` | GET/POST | List or create orders |
| `/api/orders/[id]` | GET/PUT | Get or update order |
| `/api/checkout` | POST | Create Stripe session |
| `/api/webhook/stripe` | POST | Stripe webhook handler |
| `/api/auth/verify-code` | POST | Admin email verification |
| `/api/settings` | GET/PUT | Shop settings |

---

## Database

### MongoDB Collections

| Collection | Description |
|------------|-------------|
| `products` | Product catalog |
| `orders` | Customer orders |
| `admin_emails` | Authorized admin emails |
| `verification_codes` | OTP codes for admin login |
| `settings` | Shop configuration |

### Product Schema
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  sizes?: string[];
  colors?: string[];
  image: string;
  images?: { imageId: string; dataUri: string }[];
  inStock: boolean;
  category?: 'spirit-wear' | 'regular';
  school?: string;
  requiresBabyClothes?: boolean;
}
```

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repo to Vercel
2. Add environment variables
3. Deploy

### Stripe Webhook

Set up webhook endpoint in Stripe Dashboard:
- URL: `https://stitchpleaseqc.com/api/webhook/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`

---

## iOS App

Located in `/stitch_please_ios/`. Built with Swift/SwiftUI.

### Features
- Product browsing
- Cart management
- Order tracking
- Push notifications

See `/stitch_please_ios/README.md` for setup instructions.

---

## Documentation

Additional documentation in `/docs/`:

- `API_SECURITY_GUIDE.md` - API security best practices
- `BRANCHING_STRATEGY.md` - Git workflow
- `EMAIL_SETUP.md` - Mailgun configuration
- `PERFORMANCE_OPTIMIZATION_GUIDE.md` - Performance tips

---

## Contributing

1. Create a feature branch from `main`
2. Make changes
3. Run `npm run lint` and `npm run typecheck`
4. Submit pull request

---

## License

Private - All rights reserved.

---

## Contact

**Stitch Please**  
415 13th St, Moline, IL 61265  
📞 (309) 373-6017  
🌐 [stitchpleaseqc.com](https://stitchpleaseqc.com)
