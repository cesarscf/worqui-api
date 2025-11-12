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
pnpm drizzle-kit generate
```

Push schema changes directly to database:
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

- `src/server.ts` - Main Fastify application entry point, configures CORS, Swagger, Scalar docs, and starts HTTP server
- `src/env.ts` - Environment variable validation using Zod (DATABASE_URL, PORT, NODE_ENV)
- `src/db/` - Database layer
  - `index.ts` - Drizzle database instance and postgres connection
  - `schema/index.ts` - All database table definitions and relations
  - `utils.ts` - Shared schema utilities (lifecycleDates helper)

### Database Schema

The application models a service marketplace with these core entities:

**Main Entities:**
- `professionals` - Service providers with email, phone, expertise
- `customers` - Service requesters with contact information
- `service_categories` - Types of services offered
- `requests` - Customer service requests with status tracking
- `quotations` - Professional responses to requests with pricing

**Supporting Tables:**
- `professional_coverage` - Geographic service areas with lat/long/radius
- `professional_service_categories` - Junction table linking professionals to categories
- `service_addresses` - Full address details for service requests
- `verifications` - Temporary codes for email/phone verification

**Key Patterns:**
- All tables use UUID primary keys with `defaultRandom()`
- All entities include `createdAt` and `updatedAt` timestamps via the `lifecycleDates` utility
- Foreign keys use `onDelete: "cascade"` for referential integrity
- Relations are defined using Drizzle's `relations()` for type-safe queries

### Environment Configuration

Required environment variables (defined in src/env.ts):
- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - HTTP server port (default: 3333)
- `NODE_ENV` - Environment mode: development/test/production (default: development)

Store these in `.env` file at project root. The dev server uses `tsx --env-file=.env` to load them.

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

When adding new routes or features:
1. Define Zod schemas for request/response validation
2. Use Fastify's `.withTypeProvider<ZodTypeProvider>()` for type inference
3. Register routes in appropriate route files (to be created)
4. Add Drizzle schema changes in `src/db/schema/index.ts`
5. Run `pnpm drizzle-kit generate` to create migrations
6. Ensure all relations are defined for type-safe joins

## API Documentation

The API uses Scalar for interactive documentation. After starting the dev server, visit http://localhost:3333/docs to explore endpoints. OpenAPI schema is auto-generated from Zod validators.
