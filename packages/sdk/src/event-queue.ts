import { EventData } from './types';

export class EventQueue {
  private queue: EventData[] = [];
  private timer: NodeJS.Timeout | null = null;
  private isFllushing = false;

  constructor(
    private apiKey: string,
    private apiUrl: string,
    private batchSize: number,
    private flushInterval: number,
    private debug: boolean
  ) {
    this.startTimer();
  }

  add(event: EventData): void {
    this.queue.push(event);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.isFllushing || this.queue.length === 0) {
      return;
    }

    this.isFllushing = true;
    const events = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(`${this.apiUrl}/api/events/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          events,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send events: ${response.statusText}`);
      }

      if (this.debug) {
        console.log(`[ExperimentLab] Flushed ${events.length} events`);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[ExperimentLab] Failed to flush events:', error);
      }
      
      this.queue.unshift(...events);
    } finally {
      this.isFllushing = false;
    }
  }

  clear(): void {
    this.queue = [];
    this.stopTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}