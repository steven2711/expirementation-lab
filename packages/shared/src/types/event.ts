export type EventType = 'assignment' | 'conversion' | 'pageview' | 'custom';

export interface Event {
  id: string;
  experimentId: string;
  userId: string;
  sessionId?: string;
  eventType: EventType;
  variant: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  properties?: Record<string, any>;
}

export interface EventBatch {
  apiKey: string;
  events: Omit<Event, 'id'>[];
}