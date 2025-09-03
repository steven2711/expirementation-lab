import { VariantAssignment } from './types';

export class Storage {
  private prefix = 'experimentlab_';
  private memoryStorage: Map<string, any> = new Map();

  constructor(private useLocalStorage: boolean) {}

  setUserId(userId: string): void {
    this.set('userId', userId);
  }

  getUserId(): string | null {
    return this.get('userId');
  }

  setAnonymousId(id: string): void {
    this.set('anonymousId', id);
  }

  getAnonymousId(): string | null {
    return this.get('anonymousId');
  }

  setVariant(key: string, assignment: VariantAssignment): void {
    this.set(key, assignment);
  }

  getVariant(key: string): VariantAssignment | null {
    return this.get(key);
  }

  clear(): void {
    if (this.useLocalStorage && typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    }
    this.memoryStorage.clear();
  }

  private set(key: string, value: any): void {
    const prefixedKey = `${this.prefix}${key}`;
    const serialized = JSON.stringify(value);

    if (this.useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(prefixedKey, serialized);
      } catch (e) {
        this.memoryStorage.set(prefixedKey, value);
      }
    } else {
      this.memoryStorage.set(prefixedKey, value);
    }
  }

  private get(key: string): any {
    const prefixedKey = `${this.prefix}${key}`;

    if (this.useLocalStorage && typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(prefixedKey);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return this.memoryStorage.get(prefixedKey) || null;
      }
    } else {
      return this.memoryStorage.get(prefixedKey) || null;
    }
  }
}