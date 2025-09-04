# ExperimentLab

A developer-first experimentation platform for A/B testing and feature flags. Built with modern technologies to provide real-time analytics, statistical significance calculations, and easy SDK integration.

## Features

- **A/B Testing**: Create and manage experiments with flexible traffic allocation
- **Real-time Analytics**: Monitor conversion rates and user engagement as it happens
- **Statistical Engine**: Built-in significance testing with confidence intervals
- **Lightweight SDK**: < 10KB JavaScript SDK for easy integration
- **Developer Friendly**: RESTful API, TypeScript support, and comprehensive documentation
- **Performance Optimized**: Redis caching, event batching, and efficient data aggregation

## Tech Stack

- **Backend**: Node.js with Fastify framework
- **Frontend**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (optional, falls back to in-memory)
- **SDK**: TypeScript with Rollup bundling
- **Authentication**: JWT-based auth with bcrypt
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization

## Project Structure

This is a monorepo using npm workspaces:

```
experimentation-lab/
├── packages/
│   ├── api/          # Fastify backend API
│   ├── dashboard/    # Next.js frontend
│   ├── sdk/          # JavaScript SDK
│   └── shared/       # Shared types and utilities
├── prisma/           # Database schema and migrations
└── package.json      # Root package with workspace config
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/experimentlab.git
cd experimentlab
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and configuration
```

4. Set up the database:
```bash
npm run db:setup  # Generate Prisma client and push schema
npm run db:seed   # Optional: seed with sample data
```

5. Start development servers:
```bash
npm run dev  # Starts both API (port 4000) and dashboard (port 3000)
```

## Development

### Available Scripts

```bash
# Development
npm run dev                  # Start all services
npm run dev:api              # Start API only
npm run dev:dashboard        # Start dashboard only
npm run dev:sdk              # Build SDK in watch mode

# Database
npm run db:generate          # Generate Prisma client
npm run db:push              # Push schema changes
npm run db:migrate           # Run migrations
npm run db:seed              # Seed database

# Code Quality
npm run lint                 # Lint all packages
npm run type-check           # TypeScript type checking
npm run test                 # Run all tests

# Production
npm run build                # Build all packages
```

### Working with Packages

Run commands for specific packages:
```bash
npm run test -w @experimentlab/api       # Test API package
npm run lint -w @experimentlab/dashboard # Lint dashboard
npm run build -w @experimentlab/sdk       # Build SDK
```

## SDK Integration

Install the SDK in your application:

```javascript
import { ExperimentLab } from '@experimentlab/sdk';

// Initialize the SDK
const experimentLab = new ExperimentLab({
  apiKey: 'your-project-api-key',
  apiUrl: 'https://api.your-domain.com'
});

// Get experiment variant
const variant = await experimentLab.getVariant('experiment-id', userId);

// Track conversion
await experimentLab.trackConversion('experiment-id', userId);

// Track custom event
await experimentLab.trackEvent('experiment-id', userId, 'button-click', {
  buttonId: 'cta-main'
});
```

## API Documentation

### Authentication

All API endpoints (except `/health` and `/api/events`) require JWT authentication:

```bash
POST /api/auth/register  # Create new account
POST /api/auth/login     # Login and receive JWT
```

### Core Endpoints

```bash
# Projects
GET    /api/projects      # List projects
POST   /api/projects      # Create project
GET    /api/projects/:id  # Get project details

# Experiments
GET    /api/experiments              # List experiments
POST   /api/experiments              # Create experiment
GET    /api/experiments/:id          # Get experiment
PUT    /api/experiments/:id          # Update experiment
GET    /api/experiments/:id/results  # Get results with statistics

# Events (Public endpoint for SDK)
POST   /api/events  # Track events (uses API key auth)
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/experimentlab"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# API Configuration
API_PORT=4000
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

# Dashboard Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Architecture

### Data Flow

1. **Client Integration**: Applications integrate the SDK to participate in experiments
2. **Variant Assignment**: SDK requests variant assignment from API
3. **Event Tracking**: User interactions are batched and sent to the API
4. **Data Storage**: Events stored in PostgreSQL with optional Redis caching
5. **Analytics Processing**: API aggregates data and calculates statistics
6. **Visualization**: Dashboard displays real-time results and insights

### Statistical Analysis

The platform implements proper statistical testing for A/B experiments:

- Two-proportion z-test for conversion rate comparison
- 95% confidence intervals
- Sample size calculations
- Power analysis for experiment planning
- Statistical significance determination (p < 0.05)

## Deployment

### Production Build

```bash
npm run build  # Build all packages for production
```

### Database Migrations

For production deployments:

```bash
npx prisma migrate deploy  # Apply migrations to production database
```

### Docker Support

Docker configuration coming soon.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the [GitHub issues page](https://github.com/yourusername/experimentlab/issues).