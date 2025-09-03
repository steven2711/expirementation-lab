# ExperimentLab - Product Requirements Document

## Phase 1: MVP Experimentation Platform

### Executive Summary

**Product Vision:** A developer-first experimentation platform that enables teams to run A/B tests and feature flags with enterprise-grade statistical rigor, packaged in an intuitive interface.

**Phase 1 Goal:** Build a functional MVP that demonstrates core platform capabilities - experiment creation, SDK integration, real-time analytics, and basic statistical analysis. Target: Single developer/small team use case.

### Problem Statement

Existing experimentation platforms are either:

- Too expensive for small teams (Optimizely, Adobe Target)
- Too basic for reliable insights (homegrown solutions)
- Too complex for non-statisticians to interpret
- Too coupled to specific tech stacks

We're building a platform that bridges this gap with developer-friendly APIs and business-friendly reporting.

### Solution Overview

#### Core Architecture:

```
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   Dashboard     │  │  Platform API    │  │  Developer SDK  │
│  (React App)    │◄──►│   (Node.js)     │◄──►│  (JavaScript)  │
└─────────────────┘  └──────────────────┘  └─────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │    Database      │
                     │  (PostgreSQL +   │
                     │     Redis)       │
                     └──────────────────┘
```

#### User Flow:

1. Developer signs up → Creates project → Gets API key
2. Integrates SDK into their application code
3. Creates experiments via dashboard
4. Launches experiments and views real-time results
5. Makes data-driven decisions with statistical guidance

### Technical Architecture

#### Frontend Dashboard

- **Framework:** Next.js (latest stable) with TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts or Chart.js
- **State:** React Query for server state
- **Auth:** NextAuth.js with JWT

#### Backend API

- **Runtime:** Node.js with Express/Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL for persistent data
- **Cache:** Redis for feature flag lookups
- **Validation:** Zod for schema validation
- **Deployment:** Docker containers

#### Developer SDK

- **Package:** NPM package for JavaScript/TypeScript
- **Bundle Size:** <10KB gzipped
- **Caching:** Local storage + in-memory cache
- **Batching:** Event batching for performance

#### Infrastructure

- **Hosting:** Vercel (frontend) + Railway/Render (backend)
- **Database:** Prisma PostgreSQL/ Minio (dev)
- **Cache:** Upstash Redis
- **Monitoring:** Basic logging and error tracking

### Phase 1 Feature Scope

#### Core Features ✅

##### 1. Project Management

- Single-project support per user
- API key generation
- Basic project settings

##### 2. Experiment Creation

- Simple A/B test setup (2 variants max)
- Traffic allocation (50/50 split only)
- Conversion event definition
- Manual start/stop controls

##### 3. Developer SDK

```javascript
// Core SDK functionality
const experiment = new ExperimentLab("api-key");

// Get variant assignment
const variant = await experiment.getVariant("button-test");

// Track conversion
experiment.track("conversion", {
  experimentId: "button-test",
  userId: "user123",
});
```

##### 4. Real-time Analytics

- Live visitor counts per variant
- Conversion rates with confidence intervals
- Basic statistical significance testing
- Visual results dashboard

##### 5. Statistical Engine

- Two-proportion z-test for conversion rates
- 95% confidence intervals
- Sample size recommendations
- "Too early to call" warnings

#### Phase 1 Limitations 🚫

Explicitly NOT included:

- Multi-project support
- User management/teams
- Advanced targeting rules
- Revenue/continuous metrics
- Bayesian statistics
- Multiple simultaneous experiments
- Webhook integrations

### Database Schema (Core Tables)

```sql
-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  api_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP
);

-- Experiments
CREATE TABLE experiments (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255),
  status VARCHAR(50), -- draft, running, stopped
  traffic_allocation JSONB, -- {"control": 50, "variant": 50}
  created_at TIMESTAMP,
  started_at TIMESTAMP,
  stopped_at TIMESTAMP
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY,
  experiment_id UUID REFERENCES experiments(id),
  user_id VARCHAR(255),
  event_type VARCHAR(50), -- assignment, conversion
  variant VARCHAR(50),
  metadata JSONB,
  timestamp TIMESTAMP
);
```

### Success Metrics

#### Technical Success

- SDK integration takes <5 minutes
- Dashboard loads experiment results in <500ms
- Statistical calculations are accurate vs industry tools
- Platform handles 1,000 concurrent users

#### User Experience Success

- Non-technical user can interpret results correctly
- Developer can integrate without reading docs (intuitive API)
- "Time to first insight" < 30 minutes from signup

#### Business Success

- Complete end-to-end experiment lifecycle
- Demonstrates statistical rigor comparable to enterprise tools
- Portfolio-quality codebase and documentation

### Development Timeline

#### Week 1-2: Foundation

- Project setup and infrastructure
- Database schema and migrations
- Basic API routes (CRUD for experiments)

#### Week 3-4: Core Platform

- Dashboard UI for experiment creation
- Basic SDK implementation
- Event tracking pipeline

#### Week 5-6: Analytics Engine

- Statistical calculation implementation
- Results dashboard and visualizations
- Real-time updates

#### Week 7-8: Polish & Testing

- End-to-end testing with real data
- Documentation and examples
- Performance optimization

### Post-Phase 1 Roadmap

- **Phase 2:** Multi-project support, user management, advanced targeting
- **Phase 3:** Revenue metrics, Bayesian stats, webhooks
- **Phase 4:** Enterprise features, SSO, advanced analytics
