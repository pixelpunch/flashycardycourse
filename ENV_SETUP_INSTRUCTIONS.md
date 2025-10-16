# Environment Setup Instructions

## 🎯 Quick Setup to Sync Your Users

To sync your Clerk user (`dasfamilych@gmail.com`) to the Neon database, follow these steps:

### Step 1: Create `.env.local` File

Create a new file called `.env.local` in the root of your project with the following content:

```bash
# Clerk Authentication
# Get these from: https://dashboard.clerk.com > Select Your App > API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk Webhook Secret (optional for now)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Neon Database - ✅ ALREADY FILLED IN FOR YOU!
DATABASE_URL=postgresql://neondb_owner:npg_RCo3Py1WIxTM@ep-shy-smoke-agh9jv4s-pooler.c-2.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### Step 2: Get Your Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click on **API Keys** in the left sidebar
4. Copy the following:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`) - Click "Show" to reveal it

### Step 3: Update `.env.local`

Replace these values in your `.env.local` file:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Paste your Publishable Key
- `CLERK_SECRET_KEY` - Paste your Secret Key
- `DATABASE_URL` - **Already set!** (retrieved from your Neon project)

### Step 4: Run the Sync Command

After saving your `.env.local` file, run:

```bash
npm run sync:users
```

This will sync all your Clerk users (including `dasfamilych@gmail.com`) to your Neon database.

### Step 5: Verify the Sync

Check your database to confirm the user was created:

```bash
npm run db:studio
```

Then browse to the `users` table and look for `dasfamilych@gmail.com`.

## 📋 Quick Command Reference

```bash
# Create .env.local file (on Mac/Linux)
touch .env.local

# Edit with your preferred editor
code .env.local        # VS Code
nano .env.local        # Terminal editor
vim .env.local         # Vim

# After setting up .env.local:
npm run sync:users     # Sync Clerk users to database
npm run db:studio      # Open database browser
npm run dev           # Start development server
```

## ✅ What You Already Have

- ✅ **Neon Project**: "Flashy Cardy Course" 
- ✅ **Database URL**: Retrieved and ready to use (see above)
- ✅ **Database Schema**: Tables created (`users`, `decks`, `cards`)
- ✅ **Sync Script**: Ready to run
- ✅ **Webhook Endpoint**: `/api/webhooks/clerk` created

## 🔍 Troubleshooting

### "Missing Clerk Secret Key" Error
**Solution**: You need to add `CLERK_SECRET_KEY` to your `.env.local` file (see Step 2-3 above)

### "DATABASE_URL environment variable is required" Error  
**Solution**: The DATABASE_URL is already provided above - just copy the entire `.env.local` content from Step 1

### Can't Find Clerk Keys
1. Go to https://dashboard.clerk.com
2. Make sure you're in the correct organization
3. Select your application
4. Look for "API Keys" or "Developers" in the sidebar

## 🔐 Security Notes

- ✅ `.env.local` is already in `.gitignore` - your secrets won't be committed
- ❌ **NEVER** commit API keys or secrets to version control
- ❌ **NEVER** share your `CLERK_SECRET_KEY` or database passwords
- ✅ Use different keys for development and production

## 📚 Need More Help?

- [Clerk API Keys Documentation](https://clerk.com/docs/references/backend/overview)
- [Neon Connection Strings](https://neon.tech/docs/connect/connect-from-any-app)
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Webhook setup guide

