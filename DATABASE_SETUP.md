# Database Setup with Drizzle ORM

This project uses Drizzle ORM with Neon Postgres database.

## Configuration

The database connection is configured using the following environment variable in `.env`:
```
DATABASE_URL="postgresql://neondb_owner:npg_RCo3Py1WIxTM@ep-shy-smoke-agh9jv4s-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to the database (for development)
- `npm run db:migrate` - Apply migration files to the database
- `npm run db:pull` - Pull schema from the database to local files
- `npm run db:studio` - Open Drizzle Studio for database management

## File Structure

- `drizzle.config.ts` - Drizzle configuration file
- `src/lib/db.ts` - Database connection and Drizzle instance
- `src/lib/db/schema/` - Database schema definitions
- `src/lib/db/schema/index.ts` - Schema exports
- `src/lib/db/schema/users.ts` - Example users table schema

## Usage

```typescript
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// Example query
const allUsers = await db.select().from(users);

// Example insert
const newUser = await db.insert(users).values({
  clerkId: "user_123",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe"
}).returning();
```

## Getting Started

1. Make sure your `.env` file contains the `DATABASE_URL`
2. Push your schema to the database: `npm run db:push`
3. Start using the database in your application!

## Adding New Tables

1. Create a new schema file in `src/lib/db/schema/`
2. Export it from `src/lib/db/schema/index.ts`
3. Run `npm run db:push` to update the database
