# @experimentlab/sdk

JavaScript SDK for ExperimentLab A/B testing platform.

## Installation

```bash
npm install @experimentlab/sdk
```

## Quick Start

```javascript
import ExperimentLab from '@experimentlab/sdk';

const client = new ExperimentLab({
  apiKey: 'your-api-key',
  apiUrl: 'http://localhost:4000'
});

// Get variant
const variant = await client.getVariant('experiment-id', 'user-id');

// Track conversion
client.conversion('experiment-id');
```

## API

### `getVariant(experimentId, userId?)`
Returns 'control' or 'variant' for the user.

### `track(eventType, data)`
Track custom events.

### `conversion(experimentId, metadata?)`
Track conversion events.

### `identify(userId)`
Set persistent user ID.

## Full documentation

See [https://github.com/yourusername/experimentlab](https://github.com/yourusername/experimentlab) for complete documentation and examples.