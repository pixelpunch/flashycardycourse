# Clerk Webhook Setup Guide

This guide explains how to set up Clerk webhooks to automatically sync users to your Neon database.

## Prerequisites

- Clerk account with a configured application
- Neon database (already configured)
- Deployed Next.js application (or ngrok for local testing)

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

You'll get this secret after creating the webhook in the Clerk Dashboard (see step 3 below).

## Setup Steps

### 1. Deploy Your Application (or Use ngrok for Local Testing)

**For Production:**
- Deploy your application to Vercel, Netlify, or your preferred hosting platform
- Note your production URL (e.g., `https://yourapp.vercel.app`)

**For Local Development:**
```bash
# Install ngrok if you haven't already
npm install -g ngrok

# Start your Next.js dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Note the HTTPS URL provided by ngrok (e.g., https://abc123.ngrok.io)
```

### 2. Open Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the sidebar

### 3. Create a New Webhook Endpoint

1. Click **Add Endpoint**
2. Enter your webhook URL:
   - **Production**: `https://yourapp.vercel.app/api/webhooks/clerk`
   - **Local (ngrok)**: `https://abc123.ngrok.io/api/webhooks/clerk`
3. Select the following events to subscribe to:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
4. Click **Create**

### 4. Copy the Webhook Secret

1. After creating the webhook, Clerk will show you a **Signing Secret**
2. Copy this secret (it starts with `whsec_`)
3. Add it to your `.env.local` file:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

### 5. Restart Your Development Server

```bash
# Stop your dev server (Ctrl+C) and restart
npm run dev
```

## Testing the Webhook

### Option 1: Trigger from Clerk Dashboard

1. In Clerk Dashboard > Webhooks > Your Endpoint
2. Click on **Testing** tab
3. Select `user.created` event
4. Click **Send Example**
5. Check your application logs and database

### Option 2: Create a Real User

1. Go to your application's sign-up page
2. Create a new user account
3. After successful sign-up, check your Neon database:
   - The user should be automatically created in the `users` table
   - The `clerk_id` should match the Clerk user ID

### Option 3: Sync Existing Users

If you already have users in Clerk that aren't in your database:

1. In Clerk Dashboard > Webhooks > Your Endpoint
2. Go to the **Testing** tab
3. For each existing user:
   - Get their user ID from Clerk Dashboard > Users
   - Manually trigger a `user.created` or `user.updated` event
   - Or use the Clerk API to re-send webhook events

## Verify Database Sync

Check your Neon database to confirm the user was created:

```sql
SELECT id, clerk_id, email, first_name, last_name, created_at 
FROM users 
ORDER BY created_at DESC;
```

## Webhook Events Handled

- **`user.created`**: Creates a new user in the database
- **`user.updated`**: Updates user information (or creates if not exists)
- **`user.deleted`**: Removes user from database (cascades to decks and cards)

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL**: Make sure it's publicly accessible
2. **Check middleware**: Webhook route must be public (already configured)
3. **Check logs**: Look for errors in your application logs
4. **Verify secret**: Ensure `CLERK_WEBHOOK_SECRET` is correctly set

### Signature Verification Fails

- Make sure you copied the entire webhook secret including the `whsec_` prefix
- Restart your dev server after adding the secret
- Check that the secret matches exactly (no extra spaces)

### User Not Created in Database

1. Check application logs for errors
2. Verify database connection string is correct
3. Check that the `users` table exists and has the correct schema
4. Verify webhook is subscribed to the correct events

### Using ngrok for Local Testing

If ngrok URL expires:
1. Restart ngrok to get a new URL
2. Update the webhook URL in Clerk Dashboard
3. Test again

## Security Notes

- ✅ Webhook signatures are verified using `svix` library
- ✅ Only requests with valid signatures are processed
- ✅ Webhook route is public but protected by signature verification
- ✅ Never commit `CLERK_WEBHOOK_SECRET` to version control
- ✅ Use different webhook secrets for development and production

## Next Steps

After webhooks are working:

1. All new user sign-ups will automatically create database records
2. User updates in Clerk will sync to the database
3. Deleted users in Clerk will be removed from the database
4. You can now build features that rely on the `users` table

## Additional Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

