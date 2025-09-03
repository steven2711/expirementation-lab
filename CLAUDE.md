# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ExperimentLab is a developer-first experimentation platform for A/B testing and feature flags. It's a monorepo using npm workspaces with four main packages:

- **@experimentlab/api**: Fastify backend API (Node.js/TypeScript)
- **@experimentlab/dashboard**: Next.js frontend dashboard
- **@experimentlab/sdk**: JavaScript SDK for client integration (bundled with Rollup)
- **@experimentlab/shared**: Shared types and utilities

## Common Development Commands

### Initial Setup

```bash
npm install                  # Install all dependencies
cp .env.example .env         # Create environment file
npm run db:setup             # Generate Prisma client and push schema
npm run db:seed              # Seed initial data (optional)
```

### Development

```bash
npm run dev                  # Start API (port 4000) and dashboard (port 3000) concurrently
npm run dev:api              # Start only API server
npm run dev:dashboard        # Start only dashboard
npm run dev:sdk              # Watch and build SDK
```

### Database Management

```bash
npm run db:generate          # Generate Prisma client after schema changes
npm run db:push              # Push schema to database
npm run db:migrate           # Create and run migrations
```

### Code Quality

```bash
npm run lint                 # Run ESLint on all packages
npm run type-check           # Run TypeScript compiler checks on all packages
npm run test                 # Run tests (Vitest) on all packages
```

### Building

```bash
npm run build                # Build all packages for production
```

### Testing Individual Packages

```bash
npm run test -w @experimentlab/api       # Run API tests
npm run test -w @experimentlab/sdk       # Run SDK tests
```

## Architecture Overview

### Data Flow

1. **SDK Integration**: Client applications integrate the SDK to get experiment variants and track events
2. **Event Collection**: SDK sends events to API endpoints (`/api/events`)
3. **Storage**: Events stored in PostgreSQL, with Redis caching for performance
4. **Analytics**: Dashboard fetches aggregated data from API for real-time visualization
5. **Statistical Engine**: API calculates conversion rates, confidence intervals, and significance

### Key Design Patterns

**API Architecture** (packages/api/):

- Routes organized by resource (auth, projects, experiments, events)
- Middleware for authentication (JWT) and error handling
- Services layer for business logic (assignment, statistics)
- Prisma ORM for database operations

**Dashboard Architecture** (packages/dashboard/):

- Next.js App Router with server components where applicable
- React Query for server state management
- Zustand for client state (if needed)
- Tailwind CSS for styling
- Recharts for data visualization

**SDK Architecture** (packages/sdk/):

- Lightweight client library (<10KB target)
- Local storage + in-memory caching
- Event batching for performance
- Rollup for multiple build formats (ESM, CJS, IIFE)

### Database Schema

The PostgreSQL schema (defined in prisma/schema.prisma) includes:

- **Users**: Authentication and account management
- **Projects**: Container for experiments (single project per user in Phase 1)
- **Experiments**: A/B test configurations with traffic allocation
- **Events**: User interactions (assignments, conversions, custom events)

### Statistical Engine

Located in packages/api/src/services/statistics.ts:

- Two-proportion z-test for conversion rate comparison
- 95% confidence interval calculations
- Sample size recommendations
- Statistical significance determination

## Environment Variables

Required variables (see .env.example):

- DATABASE_URL: PostgreSQL connection string
- REDIS_URL: Redis connection (optional, falls back to in-memory)
- JWT_SECRET: Authentication secret
- API_PORT: Backend port (default: 4000)
- NEXT_PUBLIC_API_URL: API endpoint for dashboard

## Key Files to Understand

- packages/api/src/routes/events.ts: Event ingestion endpoint
- packages/api/src/services/assignment.ts: Variant assignment logic
- packages/api/src/services/statistics.ts: Statistical calculations
- packages/dashboard/app/experiments/[id]/page.tsx: Experiment results view
- packages/sdk/src/index.ts: SDK entry point and API
