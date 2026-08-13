/**
 * Production Performance Optimization
 * Multi-level caching, token optimization, rate limiting, and context management
 */

import { metrics } from './metrics.js';

// ============================================================================
// MULTI-LEVEL CACHING SYSTEM
// ============================================================================

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
  ttl: number;
  size: number;
  level: 'memory' | 'distributed' | 'cdn';
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

class MultiLevelCache<T> {
  private memory: Map<string, CacheEntry<T>> = new Map();
  private currentSize: number = 0;
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB
      defaultTTL: 3600000, // 1 hour
      cleanupInterval: 600000, // 10 minutes
      ...config,
    };

    // Start cleanup interval
    setInterval(() => this.cleanup(), this.config.cleanupInterval);
  }

  // Get from cache
  async get(key: string): Promise<T | null> {
    const entry = this.memory.get(key);

    if (!entry) {
      metrics.increment('cache_miss', 1);
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memory.delete(key);
      this.currentSize -= entry.size;
      metrics.increment('cache_miss', 1);
      return null;
    }

    entry.hits++;
    metrics.increment('cache_hit', 1);

    return entry.value;
  }

  // Set in cache
  async set(key: string, value: T, ttl?: number, size?: number): Promise<void> {
    // Calculate size if not provided
    if (!size) {
      size = this.calculateSize(value);
    }

    // Check if we need to evict
    if (this.currentSize + size > this.config.maxSize) {
      this.evict(size);
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      hits: 0,
      ttl: ttl || this.config.defaultTTL,
      size,
      level: 'memory',
    };

    // Remove old entry if exists
    const oldEntry = this.memory.get(key);
    if (oldEntry) {
      this.currentSize -= oldEntry.size;
    }

    this.memory.set(key, entry);
    this.currentSize += size;

    metrics.gauge('cache_size_bytes', this.currentSize);
  }

  // Invalidate cache entry
  async invalidate(key: string): Promise<void> {
    const entry = this.memory.get(key);
    if (entry) {
      this.memory.delete(key);
      this.currentSize -= entry.size;
      metrics.increment('cache_invalidation', 1);
    }
  }

  // Invalidate by pattern
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    let invalidated = 0;

    for (const key of this.memory.keys()) {
      if (regex.test(key)) {
        const entry = this.memory.get(key)!;
        this.memory.delete(key);
        this.currentSize -= entry.size;
        invalidated++;
      }
    }

    metrics.increment('cache_pattern_invalidation', invalidated);
  }

  // Evict entries to make room
  private evict(requiredSize: number): void {
    // Evict least recently used entries
    const entries = Array.from(this.memory.entries())
      .sort((a, b) => a[1].hits - b[1].hits);

    let freed = 0;
    for (const [key, entry] of entries) {
      if (freed >= requiredSize) break;

      this.memory.delete(key);
      this.currentSize -= entry.size;
      freed += entry.size;

      metrics.increment('cache_eviction', 1);
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memory.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memory.delete(key);
        this.currentSize -= entry.size;
        cleaned++;
      }
    }

    if (cleaned > 0) {
      metrics.increment('cache_cleanup', cleaned);
    }
  }

  // Calculate size of value
  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate in bytes
    } catch {
      return 1024; // Default to 1KB
    }
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.memory.values());
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    const avgHits = entries.length > 0 ? totalHits / entries.length : 0;

    return {
      entries: this.memory.size,
      size: this.currentSize,
      maxSize: this.config.maxSize,
      hitRate: entries.length > 0 ? totalHits / (totalHits + metrics.getCounter('cache_miss')) : 0,
      avgHits,
    };
  }
}

// Global cache instances
export const responseCache = new MultiLevelCache<any>({ maxSize: 50 * 1024 * 1024 });
export const toolCache = new MultiLevelCache<any>({ maxSize: 20 * 1024 * 1024 });
export const referenceCache = new MultiLevelCache<any>({ maxSize: 30 * 1024 * 1024 });

// ============================================================================
// TOKEN OPTIMIZATION
// ============================================================================

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

class TokenOptimizer {
  private compressionRules: Map<string, (text: string) => string> = new Map();

  constructor() {
    // Setup compression rules
    this.setupCompressionRules();
  }

  // Optimize prompt for token usage
  optimizePrompt(prompt: string): string {
    let optimized = prompt;

    // Apply compression rules
    for (const [name, rule] of this.compressionRules) {
      optimized = rule(optimized);
    }

    const originalTokens = this.estimateTokens(prompt);
    const optimizedTokens = this.estimateTokens(optimized);

    metrics.gauge('prompt_compression_ratio', originalTokens / optimizedTokens);

    return optimized;
  }

  // Estimate token count (rough estimate)
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  // Calculate response token usage
  calculateUsage(prompt: string, response: string): TokenUsage {
    return {
      prompt: this.estimateTokens(prompt),
      completion: this.estimateTokens(response),
      total: this.estimateTokens(prompt + response),
    };
  }

  // Setup compression rules
  private setupCompressionRules(): void {
    // Remove redundant whitespace
    this.compressionRules.set('whitespace', (text) => {
      return text.replace(/\s+/g, ' ').trim();
    });

    // Compress repeated phrases
    this.compressionRules.set('repeated_phrases', (text) => {
      const phrases: Record<string, string> = {
        'Please provide': 'Provide',
        'I would like you to': 'Please',
        'In accordance with': 'Per',
        'Additionally': 'Also',
      };

      let compressed = text;
      for (const [phrase, replacement] of Object.entries(phrases)) {
        compressed = compressed.split(phrase).join(replacement);
      }

      return compressed;
    });

    // Remove boilerplate
    this.compressionRules.set('boilerplate', (text) => {
      const boilerplate = [
        'Thank you for your question.',
        'Let me help you with that.',
        'I hope this helps.',
      ];

      let compressed = text;
      for (const phrase of boilerplate) {
        compressed = compressed.replace(phrase, '');
      }

      return compressed;
    });
  }
}

// Global token optimizer
export const tokenOptimizer = new TokenOptimizer();

// ============================================================================
// CONTEXT WINDOW MANAGEMENT
// ============================================================================

class ContextManager {
  private maxTokens: number = 200000; // 200K token context window
  private reservedTokens: number = 20000; // Reserved for completion

  // Optimize context to fit in window
  optimizeContext(context: {
    messages: Array<{ role: string; content: string }>;
    references: string[];
    tools: any[];
  }): { optimized: typeof context; truncated: boolean } {
    let totalTokens = 0;
    const maxTokens = this.maxTokens - this.reservedTokens;

    // Calculate current token usage
    for (const msg of context.messages) {
      totalTokens += tokenOptimizer.estimateTokens(msg.content);
    }

    for (const ref of context.references) {
      totalTokens += tokenOptimizer.estimateTokens(ref);
    }

    // Check if we need to truncate
    if (totalTokens > maxTokens) {
      return {
        optimized: this.truncateContext(context, maxTokens),
        truncated: true,
      };
    }

    return {
      optimized: context,
      truncated: false,
    };
  }

  // Truncate context to fit
  private truncateContext(context: typeof context, maxTokens: number): typeof context {
    // Prioritize recent messages
    const messages = [...context.messages].slice(-5); // Keep last 5 messages

    // Summarize older messages
    const olderMessages = context.messages.slice(0, -5);
    if (olderMessages.length > 0) {
      messages.unshift({
        role: 'system',
        content: `[Summary of ${olderMessages.length} previous messages omitted for context optimization]`,
      });
    }

    // Truncate references if needed
    const references = context.references.slice(0, 3); // Keep top 3 references

    return {
      messages,
      references,
      tools: context.tools.slice(0, 5), // Keep top 5 tools
    };
  }

  // Get current context usage
  getContextUsage(context: typeof context): number {
    let total = 0;

    for (const msg of context.messages) {
      total += tokenOptimizer.estimateTokens(msg.content);
    }

    for (const ref of context.references) {
      total += tokenOptimizer.estimateTokens(ref);
    }

    return total;
  }
}

// Global context manager
export const contextManager = new ContextManager();

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitConfig {
  requests: number;
  period: number; // milliseconds
  burst?: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  // Check if request is allowed
  async isAllowed(identifier: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.config.period;

    let timestamps = this.requests.get(identifier) || [];

    // Remove old timestamps outside the window
    timestamps = timestamps.filter(ts => ts > windowStart);

    // Check if limit exceeded
    if (timestamps.length >= this.config.requests) {
      metrics.increment('rate_limit_exceeded', 1, { identifier });
      return false;
    }

    // Add current timestamp
    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    metrics.increment('rate_limit_allowed', 1, { identifier });

    return true;
  }

  // Get remaining requests
  getRemaining(identifier: string): number {
    const timestamps = this.requests.get(identifier) || [];
    const now = Date.now();
    const windowStart = now - this.config.period;

    const recentTimestamps = timestamps.filter(ts => ts > windowStart);

    return Math.max(0, this.config.requests - recentTimestamps.length);
  }

  // Reset rate limit
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Global rate limiters
export const apiRateLimiter = new RateLimiter({
  requests: 100,
  period: 60000, // 100 requests per minute
  burst: 20, // Allow burst of 20
});

export const toolRateLimiter = new RateLimiter({
  requests: 50,
  period: 60000, // 50 tool invocations per minute
});

export const llmRateLimiter = new RateLimiter({
  requests: 20,
  period: 60000, // 20 LLM calls per minute
});

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map();

  // Start timing
  start(operation: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.record(operation, duration);
    };
  }

  // Record measurement
  record(operation: string, duration: number): void {
    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }

    const measurements = this.measurements.get(operation)!;
    measurements.push(duration);

    // Keep only last 1000 measurements
    if (measurements.length > 1000) {
      measurements.shift();
    }

    metrics.histogram('operation_duration_ms', duration, [1, 5, 10, 50, 100, 500, 1000, 5000], {
      operation,
    });
  }

  // Get statistics for operation
  getStats(operation: string) {
    const measurements = this.measurements.get(operation) || [];

    if (measurements.length === 0) {
      return {
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = measurements.length;
    const sum = measurements.reduce((a, b) => a + b, 0);

    return {
      count,
      avg: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  // Get all operation stats
  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const stats: Record<string, any> = {};

    for (const operation of this.measurements.keys()) {
      stats[operation] = this.getStats(operation);
    }

    return stats;
  }
}

// Global performance monitor
export const perfMonitor = new PerformanceMonitor();

// ============================================================================
// REQUEST BATCHING
// ============================================================================

class RequestBatcher {
  private batches: Map<string, Array<{
    request: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>> = new Map();

  // Add request to batch
  async batch<T>(
    key: string,
    request: any,
    execute: (requests: any[]) => Promise<T[]>,
    options: {
      maxBatchSize?: number;
      maxWaitTime?: number;
    } = {}
  ): Promise<T> {
    const { maxBatchSize = 10, maxWaitTime = 100 } = options;

    if (!this.batches.has(key)) {
      this.batches.set(key, []);
    }

    const batch = this.batches.get(key)!;

    return new Promise<T>((resolve, reject) => {
      batch.push({ request, resolve: resolve as (value: any) => void 0, reject });

      // Execute batch if full
      if (batch.length >= maxBatchSize) {
        this.executeBatch(key, execute);
      } else {
        // Set timeout to execute batch
        setTimeout(() => {
          if (batch.length > 0) {
            this.executeBatch(key, execute);
          }
        }, maxWaitTime);
      }
    });
  }

  // Execute batch
  private async executeBatch<T>(
    key: string,
    execute: (requests: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batches.get(key);
    if (!batch || batch.length === 0) return;

    this.batches.delete(key);

    try {
      const requests = batch.map(b => b.request);
      const results = await execute(requests);

      // Resolve all promises
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });

      metrics.increment('batch_executed', 1, {
        batch_size: batch.length.toString(),
      });
    } catch (error) {
      // Reject all promises
      batch.forEach(item => {
        item.reject(error);
      });

      metrics.increment('batch_failed', 1, {
        batch_size: batch.length.toString(),
      });
    }
  }

  // Get batch stats
  getStats() {
    const stats: Record<string, number> = {};

    for (const [key, batch] of this.batches) {
      stats[key] = batch.length;
    }

    return stats;
  }
}

// Global request batcher
export const requestBatcher = new RequestBatcher();

// ============================================================================
// ADAPTIVE CACHING
// ============================================================================

class AdaptiveCache {
  private hitRates: Map<string, number[]> = new Map();
  private thresholds = {
    high: 0.7,
    low: 0.3,
  };

  // Record cache hit/miss
  record(key: string, hit: boolean): void {
    if (!this.hitRates.has(key)) {
      this.hitRates.set(key, []);
    }

    const rates = this.hitRates.get(key)!;
    rates.push(hit ? 1 : 0);

    // Keep only last 100 records
    if (rates.length > 100) {
      rates.shift();
    }
  }

  // Get hit rate for key
  getHitRate(key: string): number {
    const rates = this.hitRates.get(key);
    if (!rates || rates.length === 0) return 0;

    const sum = rates.reduce((a, b) => a + b, 0);
    return sum / rates.length;
  }

  // Should cache this key?
  shouldCache(key: string): boolean {
    const hitRate = this.getHitRate(key);

    // Cache if hit rate is above threshold or we have no data yet
    return hitRate >= this.thresholds.low || hitRate === 0;
  }

  // Should preload?
  shouldPreload(key: string): boolean {
    return this.getHitRate(key) >= this.thresholds.high;
  }

  // Get all hit rates
  getAllHitRates(): Record<string, number> {
    const rates: Record<string, number> = {};

    for (const [key, value] of this.hitRates) {
      if (value.length > 0) {
        const sum = value.reduce((a, b) => a + b, 0);
        rates[key] = sum / value.length;
      }
    }

    return rates;
  }
}

// Global adaptive cache
export const adaptiveCache = new AdaptiveCache();

// ============================================================================
// PERFORMANCE OPTIMIZATION WRAPPER
// ============================================================================

export function withPerformanceOptimization<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const end = perfMonitor.start(operation);

  try {
    return fn();
  } finally {
    end();
  }
}

export async function withCaching<T>(
  key: string,
  fn: () => Promise<T>,
  cache: MultiLevelCache<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = await cache.get(key);
  if (cached !== null) {
    adaptiveCache.record(key, true);
    return cached;
  }

  // Execute function
  const result = await fn();

  // Cache result
  await cache.set(key, result, ttl);

  adaptiveCache.record(key, false);

  return result;
}

export async function withRateLimiting<T>(
  identifier: string,
  fn: () => Promise<T>,
  rateLimiter: RateLimiter
): Promise<T> {
  const allowed = await rateLimiter.isAllowed(identifier);

  if (!allowed) {
    throw new Error(`Rate limit exceeded for ${identifier}`);
  }

  return await fn();
}
