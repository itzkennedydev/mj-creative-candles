# Git Branching Strategy

This document outlines the branching strategy for the Stitch Please project.

## Branch Structure

### Main Branch
- **`main`**: Production-ready code. Always stable and deployable.

### Feature Branches (`feature/*`)
Use these branches for developing new features or enhancing existing ones:

- **`feature/notifications`**: Order notifications, push notifications, email alerts
- **`feature/bug-report`**: Bug reporting functionality
- **`feature/orders`**: Order management, order processing, order status updates
- **`feature/products`**: Product catalog, product management, inventory
- **`feature/admin`**: Admin panel features, admin tools, admin dashboard
- **`feature/authentication`**: Login, authentication, user management
- **`feature/payments`**: Payment processing, Stripe integration, checkout

### Platform Branches (`platform/*`)
Use these branches for platform-specific development:

- **`ios/development`**: iOS app development and improvements
- **`backend/api`**: Backend API endpoints, server-side logic
- **`web/frontend`**: Web frontend, Next.js pages, UI components

## Workflow

### Starting New Work
1. Create or checkout the appropriate feature branch:
   ```bash
   git checkout feature/your-feature-name
   ```
   Or create a new one:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to remote:
   ```bash
   git push origin feature/your-feature-name
   ```

### Merging to Main
1. Ensure your feature branch is up to date:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git merge main
   ```

2. Create a pull request or merge directly:
   ```bash
   git checkout main
   git merge feature/your-feature-name
   git push origin main
   ```

## Branch Naming Convention

- **Feature branches**: `feature/description` (e.g., `feature/notifications`)
- **Platform branches**: `platform/description` (e.g., `ios/development`)
- **Bug fixes**: `fix/description` (e.g., `fix/order-status-bug`)
- **Hotfixes**: `hotfix/description` (e.g., `hotfix/payment-error`)

## Best Practices

1. **Keep branches focused**: Each branch should have a single, clear purpose
2. **Regular updates**: Merge `main` into your feature branch regularly
3. **Clear commits**: Write descriptive commit messages
4. **Clean up**: Delete merged branches to keep the repository organized
5. **Test before merge**: Ensure your code works before merging to `main`

## Current Branches

- `main` - Production branch
- `feature/notifications` - Order notifications system
- `feature/bug-report` - Bug reporting feature
- `feature/orders` - Order management
- `feature/products` - Product catalog
- `feature/admin` - Admin panel
- `feature/authentication` - Authentication system
- `feature/payments` - Payment processing
- `ios/development` - iOS app development
- `backend/api` - Backend API development
- `web/frontend` - Web frontend development

