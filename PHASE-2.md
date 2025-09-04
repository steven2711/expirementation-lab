# ExperimentLab - Phase 2 PRD
## Component-Discovery Experimentation Platform

## Executive Summary
**Phase 2 Vision:** Transform ExperimentLab from an MVP into a production-ready experimentation platform that automatically discovers and maps components at build time, enabling reliable, component-based A/B testing without fragile selectors.

**Core Innovation:** Build-time component analysis that generates reliable experiment targets, bridging the gap between development workflows and experimentation needs.

## Problem Statement Refined
### Phase 1 Limitations:

Manual experiment setup with fragile CSS selectors
Single project support limits scalability
Basic statistical analysis insufficient for enterprise use
No component-level understanding leads to unreliable experiments

Phase 2 Solution:

Build-time component discovery automatically maps experimentable elements
Component-centric experiments use stable APIs instead of selectors
Multi-tenant platform supports teams and organizations
Advanced statistical engine with Bayesian analysis and sequential testing

Technical Architecture Evolution
Build-Time Discovery Engine
┌─────────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ Component Scanner │ │ Analysis API │ │ Platform UI │
│ (Build Plugins) │───►│ (Node.js) │───►│ (Next.js) │
│ │ │ │ │ │
│ • Webpack Plugin │ │ • Component │ │ • Experiment │
│ • Babel Plugin │ │ Registry │ │ Builder │
│ • Storybook Addon │ │ • Manifest Gen │ │ • Team Mgmt │
│ • CLI Tool │ │ • SDK Endpoints │ │ • Analytics │
└─────────────────────┘ └──────────────────┘ └─────────────────┘
│
▼
┌──────────────────┐
│ Component │
│ Database │
│ (PostgreSQL) │
└──────────────────┘
Component Discovery Workflow
Build Time:
├── 1. Scan Project Files (stories, components, pages)
├── 2. Extract Component Metadata (props, variants, stories)
├── 3. Generate Component Registry (manifest.json)
├── 4. Upload to Platform via API
└── 5. SDK Downloads Updated Registry

Runtime:
├── 1. SDK Loads Component Registry
├── 2. Injects Tracking Attributes  
├── 3. Applies Active Experiments
└── 4. Reports Events to Platform

Phase 2 Feature Scope
🔍 Build-Time Component Discovery
Component Scanner Plugins:

Webpack Plugin: Integrates with any webpack-based build process
Storybook Addon: Extends existing Storybook setups
Babel Plugin: Framework-agnostic component analysis
CLI Tool: Standalone component discovery for any project

Discovery Capabilities:
javascript// Generated Component Registry
{
"components": {
"Button": {
"id": "button-component",
"file": "src/components/Button.tsx",
"framework": "react",
"props": {
"variant": ["primary", "secondary", "danger"],
"size": ["small", "medium", "large"],
"disabled": "boolean",
"children": "string"
},
"stories": ["Primary", "Secondary", "Large", "Disabled"],
"selectors": {
"primary": "[data-component='Button'][data-variant='primary']",
"fallback": "button.btn-primary"
},
"experimentable": ["variant", "children", "size"],
"contexts": ["/signup", "/checkout", "/dashboard"]
}
},
"buildMetadata": {
"timestamp": "2025-01-15T10:30:00Z",
"framework": "react",
"buildTool": "webpack",
"project": "ecommerce-frontend"
}
}
Supported Analysis:

React Components: Props, PropTypes, TypeScript interfaces
Vue Components: Props, computed properties, slots
Svelte Components: Props, reactive statements
Web Components: Attributes, custom elements
Storybook Stories: Existing component documentation

🎯 Component-Based Experimentation
Platform Experiment Builder:
┌─────────────────────────────────────┐
│ 🧪 Create Experiment │
├─────────────────────────────────────┤
│ Component: Button (Primary story) │
│ Location: /signup, /checkout │
│ │
│ Experiment Properties: │
│ ☑ variant: primary → secondary │
│ ☑ children: "Sign Up" → "Join Now" │
│ ☐ size: (no change) │
│ │
│ Traffic: 50/50 split │
│ Success Metric: button_click │
│ Duration: 14 days │
└─────────────────────────────────────┘
Advanced Targeting:

Component-level: Target specific component instances
Context-aware: Different experiments per page/route
User segments: Based on properties, behavior, or custom attributes
Progressive rollout: Gradual traffic increases
Conflict detection: Prevent overlapping experiments

🏢 Multi-Tenant Platform
Organization Management:

Team workspaces with isolated projects
Role-based access (Admin, Experimenter, Viewer)
Project permissions and component access controls
SSO integration (Google, Okta, Auth0)

Project Architecture:

Multiple projects per organization
Component registry per project with versioning
Cross-project component sharing
Environment management (dev, staging, production)

📊 Advanced Statistical Engine
Statistical Methods:

Bayesian A/B Testing: Continuous probability updates
Sequential Testing: Early stopping with SPRT
Multi-armed Bandits: Dynamic traffic allocation
Revenue/LTV Analysis: Long-term impact measurement

Business Intelligence:

Component Performance Metrics: Win rates, impact scores
Experiment Portfolio View: ROI across all experiments
Statistical Health Checks: Power analysis, sample size calculations
Automated Insights: Pattern detection, recommendation engine

🔧 Enhanced Developer Experience
SDK v2.0:
javascript// Component-aware SDK
import ExperimentLab from '@experimentlab/sdk'

const lab = new ExperimentLab({
apiKey: 'your-key',
project: 'ecommerce-frontend',
environment: 'production'
})

// Component-based experiments
const buttonProps = lab.getComponentVariant('Button', 'primary', {
context: '/signup',
userId: user.id
})

// Render with experiment props
<Button {...buttonProps} onClick={handleSignup}>
{buttonProps.children}
</Button>
Build Tool Integration:
javascript// webpack.config.js  
const { ExperimentLabPlugin } = require('@experimentlab/webpack-plugin')

module.exports = {
plugins: [
new ExperimentLabPlugin({
apiKey: 'your-key',
project: 'ecommerce-frontend',
frameworks: ['react'],
uploadRegistry: process.env.NODE_ENV === 'production'
})
]
}

Technology Stack
Build-Time Analysis

@storybook/csf-tools: Component Story Format parsing
@babel/parser + @babel/traverse: AST analysis
picomatch + globby: File pattern matching
fs-extra: Enhanced file operations

Platform Backend

Node.js + TypeScript: API services
PostgreSQL: Component registry, experiment data
Redis: Feature flag caching, session management
ClickHouse: Event storage and analytics

Platform Frontend

Next.js 14: Dashboard and admin interface
TypeScript: Type-safe development
Tailwind CSS: Consistent design system
Recharts: Data visualization
React Query: Server state management

Infrastructure

Docker + Kubernetes: Containerized deployment
AWS/GCP: Cloud hosting and services
CDN: Global SDK distribution
Monitoring: Datadog/New Relic for observability

Database Schema Evolution
sql-- Organizations & Teams
CREATE TABLE organizations (
id UUID PRIMARY KEY,
name VARCHAR(255),
plan VARCHAR(50), -- free, pro, enterprise
created_at TIMESTAMP
);

CREATE TABLE users (
id UUID PRIMARY KEY,
organization_id UUID REFERENCES organizations(id),
email VARCHAR(255) UNIQUE,
role VARCHAR(50), -- admin, experimenter, viewer
created_at TIMESTAMP
);

-- Projects & Components
CREATE TABLE projects (
id UUID PRIMARY KEY,
organization_id UUID REFERENCES organizations(id),
name VARCHAR(255),
api_key VARCHAR(255) UNIQUE,
framework VARCHAR(50), -- react, vue, svelte
created_at TIMESTAMP
);

CREATE TABLE component_registry (
id UUID PRIMARY KEY,
project_id UUID REFERENCES projects(id),
component_name VARCHAR(255),
component_data JSONB, -- Full component metadata
version VARCHAR(50),
build_timestamp TIMESTAMP,
created_at TIMESTAMP
);

-- Enhanced Experiments
CREATE TABLE experiments (
id UUID PRIMARY KEY,
project_id UUID REFERENCES projects(id),
name VARCHAR(255),
component_name VARCHAR(255),
component_variant VARCHAR(255),
experiment_config JSONB, -- Variants, targeting, etc.
status VARCHAR(50), -- draft, running, paused, completed
statistical_method VARCHAR(50), -- frequentist, bayesian, bandit
created_by UUID REFERENCES users(id),
started_at TIMESTAMP,
ended_at TIMESTAMP,
created_at TIMESTAMP
);

-- Events & Analytics (ClickHouse)
CREATE TABLE events (
timestamp DateTime64,
experiment_id String,
user_id String,
event_type String, -- assignment, conversion, click
component_name String,
variant String,
context_data String, -- JSON string
properties Map(String, String)
) ENGINE = MergeTree()
ORDER BY (experiment_id, timestamp);

Success Metrics & KPIs
Technical Success

Build Integration: <2 minute setup time for webpack/storybook projects
Component Discovery: 95%+ accuracy in identifying experimentable components
SDK Performance: <50ms overhead for experiment resolution
Platform Reliability: 99.9% uptime, <200ms API response times

User Experience Success

Time to First Experiment: <10 minutes from component discovery to running experiment
Experiment Setup: Non-technical users can create component experiments
Statistical Clarity: 90%+ of users understand experiment results without training

Business Success

Multi-tenant Architecture: Support 100+ organizations with isolated data
Component Scale: Handle 10,000+ components across all projects
Experiment Throughput: Process 1M+ experiment events per day
User Growth: 5x increase in platform adoption vs. Phase 1

Development Timeline
Months 1-2: Foundation & Discovery Engine

Component scanner plugins (Webpack, Babel, Storybook)
Basic component registry API
Multi-tenant database schema
User authentication and project management

Months 3-4: Platform & Experimentation

Component-based experiment builder UI
Advanced targeting and traffic management
SDK v2.0 with component-aware experiments
Basic statistical analysis dashboard

Months 5-6: Advanced Features & Polish

Bayesian statistics and sequential testing
Team management and permissions
Performance optimization and monitoring
Documentation and developer onboarding

Post-Phase 2 Roadmap
Phase 3: Enterprise & Ecosystem

White-label Solutions: Custom branding for enterprise clients
API Marketplace: Third-party integrations and extensions
Advanced Analytics: ML-powered insights and recommendations
Global Infrastructure: Multi-region deployment and compliance

Phase 4: AI-Powered Experimentation

Automated Experiment Generation: AI suggests optimal experiments
Predictive Analytics: Forecast experiment outcomes
Natural Language Interface: "Test different button colors on signup page"
Continuous Optimization: Self-tuning experiments

This Phase 2 represents a fundamental shift from manual, selector-based experimentation to intelligent, component-aware testing that scales with modern development workflows. The build-time discovery engine is the key differentiator that will set ExperimentLab apart from existing solutions.
