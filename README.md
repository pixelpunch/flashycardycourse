# FlashyCardyCourse 🎴

A modern flashcard application built with Next.js 15, Clerk authentication, and Neon Postgres database.

## Features

- 🔐 **Authentication**: Clerk for secure user authentication
- 📊 **Database**: Neon Postgres with Drizzle ORM
- 🎨 **UI**: shadcn/ui components with Tailwind CSS
- 🔄 **Auto Sync**: Automatic user synchronization via webhooks
- 🌓 **Dark Mode**: Built-in dark mode support

## Prerequisites

- Node.js 18+ installed
- A [Clerk](https://clerk.com) account
- A [Neon](https://neon.tech) database account

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd flashycardycourse
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Clerk Webhook Secret (optional - needed for auto-sync)
# Get this after setting up webhooks (see WEBHOOK_SETUP.md)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Neon Database
# Get this from https://console.neon.tech
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

### 3. Push Database Schema

```bash
npm run db:push
```

This will create the necessary tables (`users`, `decks`, `cards`) in your Neon database.

### 4. Sync Existing Clerk Users (Optional)

If you already have users in Clerk, sync them to the database:

```bash
npm run sync:users
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run sync:users` - Sync Clerk users to database

## Setting Up Webhooks

To enable automatic user synchronization from Clerk to your database, see the detailed guide in [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md).

Quick steps:
1. Deploy your app or use ngrok for local testing
2. Add webhook endpoint in Clerk Dashboard: `https://yourdomain.com/api/webhooks/clerk`
3. Subscribe to `user.created`, `user.updated`, and `user.deleted` events
4. Copy the webhook secret to your `.env.local` as `CLERK_WEBHOOK_SECRET`

## Project Structure

```
flashycardycourse/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   └── webhooks/    # Webhook endpoints
│   │   └── ...
│   ├── components/          # React components
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Utilities and configurations
│   │   ├── db/              # Database configuration
│   │   │   └── schema/      # Drizzle schemas
│   │   └── utils.ts
│   ├── middleware.ts        # Clerk middleware
│   └── scripts/             # Utility scripts
├── drizzle.config.ts        # Drizzle ORM configuration
├── DATABASE_SETUP.md        # Database setup guide
├── WEBHOOK_SETUP.md         # Webhook setup guide
└── ...
```

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Authentication**: [Clerk](https://clerk.com)
- **Database**: [Neon Postgres](https://neon.tech)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Font**: [Poppins](https://fonts.google.com/specimen/Poppins)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
