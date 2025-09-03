import { ExperimentLabConfig, EventData, Variant, VariantAssignment, ApiResponse } from './types';
import { EventQueue } from './event-queue';
import { Storage } from './storage';

export class ExperimentLabClient {
  private config: Required<ExperimentLabConfig>;
  private eventQueue: EventQueue;
  private storage: Storage;
  private userId: string | null = null;
  private sessionId: string;

  constructor(config: ExperimentLabConfig) {
    this.config = {
      apiUrl: 'http://localhost:4000',
      debug: false,
      flushInterval: 5000,
      batchSize: 50,
      enableLocalStorage: true,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.storage = new Storage(this.config.enableLocalStorage);
    this.eventQueue = new EventQueue(
      this.config.apiKey,
      this.config.apiUrl,
      this.config.batchSize,
      this.config.flushInterval,
      this.config.debug
    );
  }

  identify(userId: string): void {
    this.userId = userId;
    this.storage.setUserId(userId);
  }

  async getVariant(experimentId: string, userId?: string): Promise<Variant> {
    const uid = userId || this.userId || this.getAnonymousId();

    const cacheKey = `variant:${experimentId}:${uid}`;
    const cached = this.storage.getVariant(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 3600000) {
      this.log('Using cached variant', cached);
      return cached.variant;
    }

    try {
      const response = await this.fetch<{ variant: Variant }>('/api/events/variant', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          experimentId,
          userId: uid,
        }),
      });

      if (response.success && response.data) {
        const assignment: VariantAssignment = {
          experimentId,
          userId: uid,
          variant: response.data.variant,
          timestamp: Date.now(),
        };
        
        this.storage.setVariant(cacheKey, assignment);
        this.log('Got variant', assignment);
        
        return response.data.variant;
      }
    } catch (error) {
      this.error('Failed to get variant', error);
    }

    return 'control';
  }

  track(eventType: string, data: Partial<EventData> = {}): void {
    const userId = data.userId || this.userId || this.getAnonymousId();

    const event: EventData = {
      experimentId: data.experimentId || '',
      userId,
      eventType: eventType as EventData['eventType'],
      sessionId: this.sessionId,
      ...data,
    };

    this.eventQueue.add(event);
    this.log('Tracked event', event);
  }

  conversion(experimentId: string, metadata?: Record<string, any>): void {
    const userId = this.userId || this.getAnonymousId();
    const cacheKey = `variant:${experimentId}:${userId}`;
    const cached = this.storage.getVariant(cacheKey);
    
    this.track('conversion', {
      experimentId,
      userId,
      variant: cached?.variant || 'control',
      metadata,
    });
  }

  flush(): Promise<void> {
    return this.eventQueue.flush();
  }

  reset(): void {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.storage.clear();
    this.eventQueue.clear();
  }

  private async fetch<T>(path: string, options: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.config.apiUrl}${path}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      this.error('API request failed', error);
      throw error;
    }
  }

  private getAnonymousId(): string {
    let id = this.storage.getAnonymousId();
    
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.storage.setAnonymousId(id);
    }
    
    return id;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[ExperimentLab]', ...args);
    }
  }

  private error(...args: any[]): void {
    if (this.config.debug) {
      console.error('[ExperimentLab]', ...args);
    }
  }
}