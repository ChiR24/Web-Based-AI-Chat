/**
 * Search result caching system
 * Uses node-cache to store search results in memory
 */

const NodeCache = require('node-cache');

class SearchCache {
  constructor(ttlSeconds = 3600) {
    this.cache = new NodeCache({ 
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });
    
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };

    console.log(`[Cache] Initialized with TTL of ${ttlSeconds} seconds`);
  }
  
  /**
   * Get a value from the cache
   */
  get(key) {
    const value = this.cache.get(key);
    
    if (value === undefined) {
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    console.log(`[Cache] HIT for key: ${key}`);
    return value;
  }
  
  /**
   * Set a value in the cache
   */
  set(key, value, ttl = undefined) {
    this.stats.sets++;
    console.log(`[Cache] Setting key: ${key} (items: ${JSON.stringify(this.getItemCount())})`);
    return this.cache.set(key, value, ttl);
  }
  
  /**
   * Delete a value from the cache
   */
  delete(key) {
    console.log(`[Cache] Deleting key: ${key}`);
    return this.cache.del(key);
  }
  
  /**
   * Flush the entire cache
   */
  flush() {
    console.log('[Cache] Flushing all items');
    return this.cache.flushAll();
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    return {
      ...this.stats,
      keys: this.cache.keys(),
      memoryUsage: cacheStats.vsize,
      itemCount: this.getItemCount()
    };
  }
  
  /**
   * Get the number of items in the cache
   */
  getItemCount() {
    return this.cache.keys().length;
  }
}

// Export a singleton instance
module.exports = new SearchCache(); 