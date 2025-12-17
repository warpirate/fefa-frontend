/**
 * Browser Cache Utility
 * Uses localStorage and sessionStorage for client-side caching
 */

interface CacheItem<T> {
  data: T;
  expires: number;
}

class BrowserCache {
  private prefix = 'fefa_cache_';

  /**
   * Get data from localStorage cache
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (cacheItem.expires < Date.now()) {
        localStorage.removeItem(`${this.prefix}${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set data in localStorage cache
   */
  set<T>(key: string, data: T, ttl: number = 300): boolean {
    try {
      const expires = Date.now() + (ttl * 1000); // Convert seconds to milliseconds
      const cacheItem: CacheItem<T> = { data, expires };
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearExpired();
        // Try again after cleanup
        try {
          const expires = Date.now() + (ttl * 1000);
          const cacheItem: CacheItem<T> = { data, expires };
          localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(cacheItem));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Remove data from cache
   */
  remove(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  /**
   * Clear all expired cache items
   */
  clearExpired(): void {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const cacheItem: CacheItem<any> = JSON.parse(item);
            if (cacheItem.expires < now) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Remove invalid items
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Get data from sessionStorage (temporary cache, cleared on tab close)
   */
  getSession<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(`${this.prefix}${key}`);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (cacheItem.expires < Date.now()) {
        sessionStorage.removeItem(`${this.prefix}${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set data in sessionStorage
   */
  setSession<T>(key: string, data: T, ttl: number = 300): boolean {
    try {
      const expires = Date.now() + (ttl * 1000);
      const cacheItem: CacheItem<T> = { data, expires };
      sessionStorage.setItem(`${this.prefix}${key}`, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove data from sessionStorage
   */
  removeSession(key: string): void {
    sessionStorage.removeItem(`${this.prefix}${key}`);
  }
}

export const browserCache = new BrowserCache();
export default browserCache;

