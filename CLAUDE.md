# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Worqui API is a service marketplace API built with Fastify, TypeScript, Drizzle ORM, and PostgreSQL. It connects customers seeking services with professionals who offer them, including location-based matching, quotations, and service requests.

## Development Commands

### Starting the Development Server
```bash
pnpm dev
```
Runs the server with hot-reload using tsx watch. Server starts on http://localhost:3333 with API docs at http://localhost:3333/docs.

### Running in Production
```bash
pnpm start
```
Runs the compiled JavaScript from the dist directory.

### Code Formatting and Linting
```bash
pnpm check
```
Runs Biome to check and auto-fix formatting and linting issues across the codebase.

### Database Migrations

Generate migrations after schema changes:
```bash
pnpm db:generate
```

Apply migrations to database:
```bash
pnpm db:migrate
```

Push schema changes directly to database (skips migration generation):
```bash
pnpm drizzle-kit push
```

Open Drizzle Studio for database inspection:
```bash
pnpm drizzle-kit studio
```

## Architecture

### Tech Stack
- **Web Framework**: Fastify with TypeScript and Zod type validation
- **ORM**: Drizzle ORM with postgres.js driver
- **Validation**: Zod schemas with fastify-type-provider-zod for compile-time type safety
- **API Documentation**: OpenAPI/Swagger with Scalar UI
- **Code Quality**: Biome for formatting and linting

### Project Structure

- `src/server.ts` - Main Fastify application entry point, configures CORS, JWT, Swagger, Scalar docs, and registers all routes
- `src/env.ts` - Environment variable validation using Zod (DATABASE_URL, PORT, NODE_ENV, JWT_SECRET)
- `src/routes/` - API route handlers (one file per endpoint)
- `src/middlewares/` - Authentication middlewares (customer and partner)
- `src/db/` - Database layer
  - `index.ts` - Drizzle database instance and postgres connection
  - `schema/` - Individual table definitions (customers, partners, service-orders, quotations, etc.)
  - `schema/index.ts` - Re-exports all schema definitions
  - `utils.ts` - Shared schema utilities (lifecycleDates helper)
- `src/utils/` - Shared utilities (error-schemas for API responses)
- `src/@types/` - TypeScript type augmentations (Fastify request extensions)

### Database Schema

The application models a service marketplace with these core entities:

**Main Entities:**
- `partners` - Service providers with email, phone, name
- `customers` - Service requesters with email, phone, name
- `service_categories` - Types of services offered
- `service_orders` - Customer service requests with status tracking (pending, in_progress, completed, cancelled)
- `quotations` - Partner responses to service orders with pricing and status (pending, accepted, rejected)

**Supporting Tables:**
- `partner_service_categories` - Junction table linking partners to service categories they offer
- `verifications` - Temporary OTP codes for email/phone verification during authentication

**Key Patterns:**
- All tables use UUID primary keys with `defaultRandom()`
- All entities include `createdAt` and `updatedAt` timestamps via the `lifecycleDates` utility
- Foreign keys use `onDelete: "cascade"` for referential integrity
- Relations are defined using Drizzle's `relations()` for type-safe queries

### Environment Configuration

Required environment variables (defined in src/env.ts):
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - Secret key for JWT token signing (required)
- `PORT` - HTTP server port (default: 3333)
- `NODE_ENV` - Environment mode: development/test/production (default: development)

Store these in `.env` file at project root. The dev server uses `tsx --env-file=.env` to load them.

### Authentication

The API uses JWT-based authentication with two user types:
- **Customers** - Service requesters who create service orders
- **Partners** - Service providers who respond to orders with quotations

**Authentication Flow:**
1. User requests OTP via `/customer-auth/send-otp` or `/partner-auth/send-otp`
2. Verification code is stored in `verifications` table
3. User verifies OTP via `/customer-auth/verify` or `/partner-auth/verify`
4. JWT token is returned with `sub` (user ID) and `type` (customer/partner) claims

**Protected Routes:**
- Use `customerAuthMiddleware` or `partnerAuthMiddleware` in route `preHandler`
- Middlewares augment FastifyRequest with `getCurrentCustomerId()` or `getCurrentPartnerId()` methods
- Methods verify JWT token and return user ID, throwing 401 if invalid or wrong type

## Code Style

Biome enforces these conventions:
- 2-space indentation
- Double quotes for strings
- Semicolons optional (ASI enabled)
- Automatic import organization on save

## Path Aliases

TypeScript is configured with `@/*` path alias mapping to `src/*`. Use this for imports:
```typescript
import { env } from "@/env"
import { db } from "@/db"
```

## Adding New Features

### Creating New Routes

Routes follow a consistent pattern. Each route is a separate file in `src/routes/`:

```typescript
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { errorSchemas } from "@/utils/error-schemas"

export async function routeName(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/endpoint",
    {
      preHandler: [customerAuthMiddleware], // Optional: for protected routes
      schema: {
        tags: ["Tag Name"],
        summary: "Endpoint description",
        security: [{ bearerAuth: [] }], // Required for protected routes
        body: z.object({
          // Request body schema
        }),
        response: {
          200: z.object({ /* success response */ }),
          400: errorSchemas.validationError,
          401: errorSchemas.unauthorized,
          // ... other error codes
        },
      },
    },
    async (request, reply) => {
      // Handler implementation
    },
  )
}
```

**Steps to add a new route:**
1. Create new file in `src/routes/` (use kebab-case naming)
2. Define Zod schemas for request body/params/query and responses
3. Use error schemas from `src/utils/error-schemas.ts` for consistent error responses
4. Register the route in `src/server.ts` via `app.register(routeName)`
5. Update `src/@types/fastify.d.ts` if adding new request methods

### Adding Database Tables

1. Create new schema file in `src/db/schema/` (e.g., `new-table.ts`)
2. Define table using Drizzle's `pgTable`, include `...lifecycleDates` for timestamps
3. Define relations using Drizzle's `relations()` for type-safe queries
4. Export table and relations from `src/db/schema/index.ts`
5. Run `pnpm db:generate` to create migrations
6. Run `pnpm db:migrate` to apply migrations to database

## API Documentation

The API uses Scalar for interactive documentation. After starting the dev server, visit http://localhost:3333/docs to explore endpoints. OpenAPI schema is auto-generated from Zod validators.
