/**
 * Production Error Handling and Resilience Patterns
 * Circuit breakers, retry logic, graceful degradation, and fallback strategies
 */

import { metrics, errorTracker } from './metrics.js';

// ============================================================================
// CIRCUIT BREAKER PATTERN
// ============================================================================

enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  halfOpenMaxCalls: number;
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenCallCount: number = 0;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {}

  // Execute operation with circuit breaker protection
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Check if we should attempt to reset from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (now - this.lastFailureTime > this.config.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCallCount = 0;
        metrics.increment('circuit_breaker_half_open', 1, { name: this.name });
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  // Handle successful operation
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCallCount++;
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        metrics.increment('circuit_breaker_closed', 1, { name: this.name });
      }
    } else {
      this.state = CircuitState.CLOSED;
    }
  }

  // Handle failed operation
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.successCount = 0;
      metrics.increment('circuit_breaker_open', 1, { name: this.name });
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      metrics.increment('circuit_breaker_open', 1, { name: this.name });
    }
  }

  // Get current state
  getState(): CircuitState {
    return this.state;
  }

  // Get metrics
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// ============================================================================
// RETRY WITH EXPONENTIAL BACKOFF
// ============================================================================

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  context?: { operation?: string; tags?: Record<string, string> }
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxAttempts; attempt++) {
    try {
      if (attempt > 0) {
        metrics.increment('retry_attempt', 1, {
          ...context?.tags,
          attempt_number: attempt.toString(),
        });
      }

      const result = await operation();

      if (attempt > 0) {
        metrics.increment('retry_success', 1, {
          ...context?.tags,
          attempts: attempt.toString(),
        });
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt === config.maxAttempts) {
        metrics.increment('retry_exhausted', 1, context?.tags);
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );

      // Add jitter if enabled
      const finalDelay = config.jitter
        ? delay + Math.random() * 1000
        : delay;

      metrics.histogram('retry_delay_ms', finalDelay, [100, 500, 1000, 5000, 10000]);

      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError!;
}

// ============================================================================
// GRACEFUL DEGRADATION
// ============================================================================

interface DegradationLevel {
  name: string;
  priority: number;
  available: boolean;
  fallback?: () => any;
}

class GracefulDegradation {
  private levels: DegradationLevel[] = [];

  // Register degradation level
  registerLevel(level: DegradationLevel): void {
    this.levels.push(level);
    this.levels.sort((a, b) => b.priority - a.priority);
  }

  // Execute operation with graceful degradation
  async execute<T>(
    operation: () => Promise<T>,
    context?: { operation?: string }
  ): Promise<T> {
    for (const level of this.levels) {
      if (!level.available) {
        if (level.fallback) {
          metrics.increment('graceful_degradation_fallback', 1, {
            level: level.name,
            operation: context?.operation || 'unknown',
          });

          try {
            const result = await level.fallback();
            if (result) {
              return result as T;
            }
          } catch (fallbackError) {
            errorTracker.track(fallbackError as Error, {
              context: {
                operation: context?.operation,
                level: level.name,
                type: 'fallback',
              },
            });
          }
        }
        continue;
      }

      try {
        return await operation();
      } catch (error) {
        errorTracker.track(error as Error, {
          context: {
            operation: context?.operation,
            level: level.name,
          },
        });

        // Mark level as unavailable
        level.available = false;

        // Retry with next level
        continue;
      }
    }

    throw new Error('All degradation levels exhausted');
  }

  // Check if level is available
  isAvailable(levelName: string): boolean {
    const level = this.levels.find(l => l.name === levelName);
    return level ? level.available : false;
  }

  // Mark level as available/unavailable
  setAvailability(levelName: string, available: boolean): void {
    const level = this.levels.find(l => l.name === levelName);
    if (level) {
      level.available = available;
      metrics.gauge('degradation_level_available', available ? 1 : 0, {
        level: levelName,
      });
    }
  }
}

// ============================================================================
// BULKHEAD PATTERN
// ============================================================================

class Bulkhead {
  private semaphore: Map<string, { count: number; max: number }> = new Map();

  constructor(private name: string) {}

  // Create a semaphore for a resource
  registerResource(resource: string, maxConcurrent: number): void {
    this.semaphore.set(resource, { count: 0, max: maxConcurrent });
  }

  // Execute operation with bulkhead protection
  async execute<T>(
    operation: () => Promise<T>,
    resource: string,
    timeout?: number
  ): Promise<T> {
    const semaphore = this.semaphore.get(resource);

    if (!semaphore) {
      throw new Error(`Resource ${resource} not registered`);
    }

    // Wait for availability
    while (semaphore.count >= semaphore.max) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    semaphore.count++;

    try {
      const result = timeout
        ? await this.withTimeout(operation, timeout)
        : await operation();

      return result;
    } finally {
      semaphore.count--;
    }
  }

  // Timeout wrapper
  private async withTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      ),
    ]);
  }

  // Get current usage
  getUsage(resource: string): number {
    const semaphore = this.semaphore.get(resource);
    return semaphore ? semaphore.count : 0;
  }
}

// ============================================================================
// TIMEOUT PATTERN
// ============================================================================

class TimeoutController {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  // Execute with timeout
  async execute<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    context?: { operation?: string }
  ): Promise<T> {
    const timeoutId = setTimeout(() => {
      throw new Error(`Operation timed out after ${timeoutMs}ms`);
    }, timeoutMs);

    try {
      const result = await operation();
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.message.includes('timed out')) {
        metrics.increment('operation_timeout', 1, context?.tags);
      }

      throw error;
    }
  }

  // Schedule timeout
  schedule(id: string, callback: () => void, delayMs: number): void {
    const existing = this.timeouts.get(id);
    if (existing) {
      clearTimeout(existing);
    }

    const timeoutId = setTimeout(() => {
      callback();
      this.timeouts.delete(id);
    }, delayMs);

    this.timeouts.set(id, timeoutId);
  }

  // Clear timeout
  clear(id: string): void {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }
  }

  // Clear all timeouts
  clearAll(): void {
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();
  }
}

// ============================================================================
// FAILOVER PATTERN
// ============================================================================

interface FailoverTarget {
  name: string;
  priority: number;
  available: boolean;
  execute: () => Promise<any>;
  healthCheck?: () => Promise<boolean>;
}

class FailoverManager {
  private targets: FailoverTarget[] = [];

  // Register failover target
  addTarget(target: FailoverTarget): void {
    this.targets.push(target);
    this.targets.sort((a, b) => a.priority - b.priority);
  }

  // Execute with automatic failover
  async execute(): Promise<any> {
    for (const target of this.targets) {
      if (!target.available) {
        continue;
      }

      try {
        metrics.increment('failover_attempt', 1, { target: target.name });

        const result = await target.execute();

        metrics.increment('failover_success', 1, { target: target.name });
        return result;
      } catch (error) {
        errorTracker.track(error as Error, {
          context: {
            operation: 'failover',
            target: target.name,
          },
        });

        target.available = false;
        metrics.increment('failover_target_failed', 1, { target: target.name });

        // Continue to next target
      }
    }

    throw new Error('All failover targets exhausted');
  }

  // Health check all targets
  async healthCheck(): Promise<void> {
    for (const target of this.targets) {
      if (target.healthCheck) {
        try {
          target.available = await target.healthCheck();

          metrics.gauge('failover_target_available', target.available ? 1 : 0, {
            target: target.name,
          });
        } catch (error) {
          target.available = false;
          errorTracker.track(error as Error, {
            context: {
              operation: 'health_check',
              target: target.name,
            },
          });
        }
      }
    }
  }

  // Get available targets
  getAvailableTargets(): FailoverTarget[] {
    return this.targets.filter(t => t.available);
  }
}

// ============================================================================
// RESILIENCE MANAGER (COMPOSITE)
// ============================================================================

export class ResilienceManager {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private bulkheads: Map<string, Bulkhead> = new Map();
  private degradation: GracefulDegradation;
  private timeout: TimeoutController;
  private failover: Map<string, FailoverManager> = new Map();

  constructor() {
    this.degradation = new GracefulDegradation();
    this.timeout = new TimeoutController();

    // Setup default degradation levels
    this.degradation.registerLevel({
      name: 'full',
      priority: 3,
      available: true,
    });

    this.degradation.registerLevel({
      name: 'degraded',
      priority: 2,
      available: true,
      fallback: async () => {
        console.log('Operating in degraded mode');
        return null;
      },
    });

    this.degradation.registerLevel({
      name: 'minimal',
      priority: 1,
      available: true,
      fallback: async () => {
        console.log('Operating in minimal mode - basic functionality only');
        return null;
      },
    });
  }

  // Get or create circuit breaker
  getCircuitBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000,
        halfOpenMaxCalls: 3,
      };

      this.circuitBreakers.set(
        name,
        new CircuitBreaker(name, config || defaultConfig)
      );
    }

    return this.circuitBreakers.get(name)!;
  }

  // Get or create bulkhead
  getBulkhead(name: string): Bulkhead {
    if (!this.bulkheads.has(name)) {
      this.bulkheads.set(name, new Bulkhead(name));
    }

    return this.bulkheads.get(name)!;
  }

  // Execute with full resilience patterns
  async execute<T>(
    operation: () => Promise<T>,
    options: {
      circuitBreaker?: string;
      circuitBreakerConfig?: CircuitBreakerConfig;
      retry?: RetryConfig;
      bulkhead?: string;
      bulkheadResource?: string;
      timeout?: number;
      failover?: string;
      context?: { operation?: string; tags?: Record<string, string> };
    } = {}
  ): Promise<T> {
    const {
      circuitBreaker,
      circuitBreakerConfig,
      retry,
      bulkhead,
      bulkheadResource,
      timeout,
      failover,
      context,
    } = options;

    // Apply circuit breaker
    if (circuitBreaker) {
      const cb = this.getCircuitBreaker(circuitBreaker, circuitBreakerConfig);

      try {
        return await cb.execute(async () => {
          return await this.executeWithPatterns(operation, {
            retry,
            bulkhead: bulkhead ? this.getBulkhead(bulkhead) : undefined,
            bulkheadResource,
            timeout,
            failover,
            context,
          });
        });
      } catch (error) {
        metrics.increment('circuit_breaker_rejected', 1, {
          circuit_breaker: circuitBreaker,
          operation: context?.operation || 'unknown',
        });
        throw error;
      }
    }

    return await this.executeWithPatterns(operation, {
      retry,
      bulkhead: bulkhead ? this.getBulkhead(bulkhead) : undefined,
      bulkheadResource,
      timeout,
      failover,
      context,
    });
  }

  // Apply remaining resilience patterns
  private async executeWithPatterns<T>(
    operation: () => Promise<T>,
    options: {
      retry?: RetryConfig;
      bulkhead?: Bulkhead;
      bulkheadResource?: string;
      timeout?: number;
      failover?: string;
      context?: { operation?: string; tags?: Record<string, string> };
    } = {}
  ): Promise<T> {
    let op = operation;

    // Apply retry
    if (options.retry) {
      op = () => retryWithBackoff(operation, options.retry, options.context);
    }

    // Apply bulkhead
    if (options.bulkhead && options.bulkheadResource) {
      op = () => options.bulkhead!.execute(op, options.bulkheadResource);
    }

    // Apply timeout
    if (options.timeout) {
      op = () => this.timeout.execute(op, options.timeout, options.context);
    }

    // Apply failover
    if (options.failover) {
      const fm = this.failover.get(options.failover);
      if (fm) {
        return await fm.execute();
      }
    }

    return await op();
  }

  // Get resilience metrics
  getMetrics() {
    return {
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([name, cb]) => ({
        name,
        ...cb.getMetrics(),
      })),
      bulkheads: Array.from(this.bulkheads.entries()).map(([name, bh]) => ({
        name,
        usage: Object.fromEntries(bh.semaphore.keys().map(k => [k, bh.getUsage(k)])),
      })),
      degradation: this.degradation.levels.map(level => ({
        name: level.name,
        available: level.available,
      })),
    };
  }
}

// Global resilience manager
export const resilience = new ResilienceManager();
