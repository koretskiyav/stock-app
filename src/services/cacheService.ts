const CACHE_KEY_PREFIX = 'quote_cache_';
const CACHE_TIMEOUT = Number(import.meta.env.VITE_CACHE_TIMEOUT_SEC || 600);

export interface CachedData<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private getFullKey(key: string): string {
    return `${CACHE_KEY_PREFIX}${key}`;
  }

  set<T>(key: string, data: T): void {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.getFullKey(key), JSON.stringify(cacheData));
  }

  get<T>(key: string): T | null {
    const cached = localStorage.getItem(this.getFullKey(key));
    if (!cached) return null;

    try {
      const parsed: CachedData<T> = JSON.parse(cached);
      const ageSeconds = (Date.now() - parsed.timestamp) / 1000;

      if (ageSeconds < CACHE_TIMEOUT) {
        return parsed.data;
      }
    } catch (e) {
      console.error(`Error parsing cache for ${key}`, e);
    }
    return null;
  }

  /**
   * Get even if expired
   */
  getLatest<T>(key: string): T | null {
    const cached = localStorage.getItem(this.getFullKey(key));
    if (!cached) return null;

    try {
      const parsed: CachedData<T> = JSON.parse(cached);
      return parsed.data;
    } catch {
      return null;
    }
  }

  update<T>(key: string, updater: (existing: T | null) => T): void {
    const existing = this.getLatest<T>(key);
    const newData = updater(existing);
    this.set(key, newData);
  }
}

export const cacheService = new CacheService();
