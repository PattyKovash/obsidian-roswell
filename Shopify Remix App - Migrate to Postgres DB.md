# PRD: PostgreSQL Migration

**Project:** bauble-bar-cart-transform  
**Status:** Not started — implementation deferred  
**Context:** This PRD was prepared after research confirmed the issue and all code changes were validated. It is ready to be handed to an AI agent for implementation.

---

## Problem

The scaffold uses Prisma with SQLite as the session database. SQLite is a file-based database — every new deployment of the app server starts with a fresh file, wiping all active Shopify sessions. This forces merchant re-authentication on every deploy, which is unacceptable for a production app.

This is a confirmed, documented limitation as of 2026. Shopify's own deployment docs acknowledge it and recommend migrating to a managed database for production.

---

## Solution

Migrate the session database from SQLite to PostgreSQL. The `@shopify/shopify-app-session-storage-prisma` adapter requires no changes — it works with both providers automatically. Only the Prisma schema, the migration file, environment variable configuration, and dev tooling need to be updated.

---

## Files to Change

### 1. `prisma/schema.prisma`

**Current:**
```prisma
// Note that some adapters may set a maximum length for the String type by default, please ensure your strings are long
// enough when changing adapters.
// See https://www.prisma.io/docs/orm/reference/prisma-schema-reference#string for more information
datasource db {
  provider = "sqlite"
  url      = "file:dev.sqlite"
}
```

**Replace with:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 2. `prisma/migrations/`

Delete the existing SQLite migration:
```
prisma/migrations/20240530213853_create_session_table/
```

Create a new PostgreSQL migration at:
```
prisma/migrations/20260421000000_create_session_table/migration.sql
```

With this content:
```sql
-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
```

Key differences from the SQLite migration:
- `DATETIME` → `TIMESTAMP(3)` (SQLite type is not valid in PostgreSQL)
- `TEXT NOT NULL PRIMARY KEY` → separate `CONSTRAINT "Session_pkey" PRIMARY KEY ("id")` (PostgreSQL syntax)

---

### 3. `.gitignore`

**Remove** these SQLite-specific lines (no longer relevant):
```
/prisma/dev.sqlite
/prisma/dev.sqlite-journal
database.sqlite
```

**Add** an exception so `.env.example` is committed despite the `.env.*` rule:
```
!.env.example
```

The `.env.*` block should read:
```
.env
.env.*
!.env.example
```

---

### 4. `.env.example` (new file)

Create at project root:
```
# Copy this file to .env and fill in your values.
# Never commit .env to source control.

# Shopify app credentials — from your Partner Dashboard app settings
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""

# The public URL where this app is hosted (used for OAuth redirects and webhooks)
SHOPIFY_APP_URL=""

# Comma-separated list of access scopes declared in shopify.app.toml
SCOPES=""

# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
DATABASE_URL=""

# Optional: restrict app to a custom shop domain
# SHOP_CUSTOM_DOMAIN=""
```

---

### 5. `package.json` — add database scripts

Add the following scripts alongside the existing `setup` script:

```json
"db:migrate": "prisma migrate dev",
"db:reset": "prisma migrate reset",
"db:studio": "prisma studio",
```

| Script | Command | When to use |
|---|---|---|
| `yarn db:migrate` | `prisma migrate dev` | Apply migrations in dev / after schema changes — also regenerates Prisma client |
| `yarn db:reset` | `prisma migrate reset` | Wipe database and re-apply all migrations (destroys all data) |
| `yarn db:studio` | `prisma studio` | Open Prisma Studio GUI to inspect the database |
| `yarn setup` | `prisma generate && prisma migrate deploy` | Production / CI deploy only — do not use in dev |

---

### 6. `README.md` — add Developer Setup section

Insert a new `### Developer Setup (Cloning This Repo)` section between the existing `### Setup` and `### Local Development` sections. It should cover:

1. `yarn install`
2. Copy `.env.example` → `.env`, fill in values (table of all required env vars with descriptions)
3. Set up a PostgreSQL database — provide a Docker one-liner for local dev:
   ```shell
   docker run --name baublebar-cart-transform-db \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=baublebar_cart_transform \
     -p 5432:5432 \
     -d postgres:16
   ```
   With the corresponding `DATABASE_URL`:
   ```
   postgresql://postgres:postgres@localhost:5432/baublebar_cart_transform
   ```
   Also mention managed cloud databases (Supabase, Railway, Neon) as an alternative.
4. Run `yarn db:migrate` to apply migrations
5. Set up `shopify.app.toml` from `shopify.app.example.toml`
6. Run `yarn dev`
7. Include the database scripts reference table from step 5 above.

---

## Implementation Notes for the Agent

- Do not touch `app/shopify.server.ts` — the `PrismaSessionStorage` adapter requires no changes.
- Do not touch `app/db.server.ts` — the Prisma client singleton pattern is unchanged.
- The migration file timestamp (`20260421000000`) should reflect the actual date of implementation if different.
- After making all changes, the agent should verify the schema compiles: `yarn prisma validate`.
- The agent should NOT run `yarn db:migrate` — that requires a live database connection and is the developer's responsibility after setting `DATABASE_URL`.

---

## Acceptance Criteria

- [ ] `prisma/schema.prisma` uses `provider = "postgresql"` and `url = env("DATABASE_URL")`
- [ ] Old SQLite migration is deleted; new PostgreSQL-compatible migration exists
- [ ] `.env.example` exists at project root and is committed (not gitignored)
- [ ] `.gitignore` no longer references SQLite files; `!.env.example` exception is present
- [ ] `package.json` includes `db:migrate`, `db:reset`, `db:studio` scripts
- [ ] README has a complete Developer Setup section with Docker one-liner and env var table
- [ ] `app/shopify.server.ts` and `app/db.server.ts` are unchanged
