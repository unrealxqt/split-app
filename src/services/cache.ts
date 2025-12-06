// src/services/cache.ts
const cache = new Map<string, { data: any; expiry: number }>();

export function setCache(key: string, data: any, ttlMs: number = 300000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

export function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}
