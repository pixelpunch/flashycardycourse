# Quick Start Guide - Clerk to Neon Sync

This guide will help you quickly sync your existing Clerk users (including `dasfamilych@gmail.com`) to your Neon database.

## ✅ What's Already Done

1. ✅ **Neon Project**: "Flashy Cardy Course" is set up and running
2. ✅ **Database Schema**: Tables (`users`, `decks`, `cards`) are created
3. ✅ **Webhook Endpoint**: `/api/webhooks/clerk` route is created
4. ✅ **Sync Script**: Ready to sync existing users

## 🚀 Next Steps to Sync Users

### Option 1: Run the Sync Script (Recommended for Existing Users)

This will immediately sync all your existing Clerk users to the Neon database.

**Step 1:** Make sure you have your environment variables set up in `.env.local`:

```bash
# Required for the sync script
CLERK_SECRET_KEY=sk_test_your_secret_key_here
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Optional - for future webhook auto-sync
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Step 2:** Run the sync command:

```bash
npm run sync:users
```

This will:
- ✅ Fetch all users from Clerk
- ✅ Check which users exist in the database  
- ✅ Create missing users (including `dasfamilych@gmail.com`)
- ✅ Show you a summary of what was synced

### Option 2: Set Up Webhooks (Recommended for Future Users)

This will automatically sync NEW users when they sign up.

**Step 1:** Get your connection string from Neon

1. Go to [Neon Console](https://console.neon.tech)
2. Select "Flashy Cardy Course" project
3. Click "Connection Details"
4. Copy the connection string (it should look like: `postgresql://...@ep-...neon.tech/neondb?sslmode=require`)

**Step 2:** Set up environment variables

Add to your `.env.local`:

```bash
DATABASE_URL=<paste your Neon connection string here>
CLERK_SECRET_KEY=<get from Clerk Dashboard > API Keys>
```

**Step 3:** Follow the detailed webhook setup in [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)

## 📊 Verify the Sync

After running the sync script, you can verify in multiple ways:

### Check via Database Query

Run this in your Neon SQL Editor or Drizzle Studio:

```sql
SELECT id, clerk_id, email, first_name, last_name, created_at 
FROM users 
WHERE email = 'dasfamilych@gmail.com';
```

### Check via Drizzle Studio

```bash
npm run db:studio
```

Then browse to the `users` table.

### Check the Sync Output

The sync script will show you:
```
📊 Sync Summary:
   Total Clerk users: 1
   ✅ Created: 1
   ⏭️  Skipped (already exists): 0
   ❌ Errors: 0
```

## 🔍 Troubleshooting

### Error: "DATABASE_URL environment variable is required"

**Solution**: Add your Neon connection string to `.env.local`

Get it from: Neon Console > Your Project > Connection Details

### Error: "CLERK_SECRET_KEY is required"

**Solution**: Add your Clerk secret key to `.env.local`

Get it from: Clerk Dashboard > API Keys > Secret Keys

### User still not showing in database

1. **Check Clerk Dashboard**: Make sure the user exists in Clerk
2. **Check email**: Verify the exact email address
3. **Run sync again**: `npm run sync:users` - it's safe to run multiple times
4. **Check logs**: Look for any error messages in the console

## 📚 Additional Resources

- [README.md](./README.md) - Full project documentation
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Complete webhook setup guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup instructions

## 💡 Pro Tips

1. **Sync is Idempotent**: You can run `npm run sync:users` multiple times safely - it won't create duplicates
2. **Set Up Webhooks**: After the initial sync, set up webhooks so new users are automatically synced
3. **Regular Syncs**: You can run the sync script anytime to catch any users that might have been missed

## 🎯 Expected Outcome

After running the sync:

- ✅ User `dasfamilych@gmail.com` will appear in your Neon `users` table
- ✅ User will have a unique `id` (UUID)
- ✅ User's `clerk_id` will match their Clerk user ID
- ✅ All other user fields will be populated from Clerk
- ✅ Future sign-ups will auto-sync (if webhooks are set up)

