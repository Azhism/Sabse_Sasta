# Database Migrations

## Initial Setup

Since you're using an existing PostgreSQL database with tables already created, you have two options:

### Option 1: Use Prisma Migrate (Recommended for new setup)
If you want to use Prisma migrations going forward:

```bash
# This will create a migration based on your schema
npx prisma migrate dev --name init

# Or if you want to mark the database as already in sync
npx prisma db push
```

### Option 2: Use Existing Database (Current Setup)
If your database already has the tables from Supabase migrations:

1. Make sure your `DATABASE_URL` in `.env` points to your existing database
2. Run `npx prisma db pull` to introspect your existing database and update the schema
3. Run `npx prisma generate` to generate the Prisma client

## Important Notes

- The Prisma schema assumes you have a `users` table. If you're using Supabase's `auth.users`, you may need to:
  - Create a separate `users` table for JWT authentication, OR
  - Modify the schema to work with Supabase's auth system

- The existing Supabase migrations use `auth.users(id)` as foreign keys. For JWT auth, we're creating our own `users` table.

- You may need to migrate data from `auth.users` to the new `users` table if you want to keep existing user data.

