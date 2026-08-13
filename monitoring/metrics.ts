/**
 * Production Monitoring and Alerting System
 * Comprehensive monitoring with metrics, tracing, error tracking, and alerting
 */

import { EventEmitter } from 'events';

// ============================================================================
// METRICS COLLECTION
// ============================================================================

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  labels: Record<string, string>;
}

interface Histogram {
  name: string;
  count: number;
  sum: number;
  buckets: Record<number, number>;
}

class MetricsCollector extends EventEmitter {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private metrics: Metric[] = [];
  private maxMetrics: number = 10000;

  // Increment a counter
  increment(name: string, value: number = 1, labels?: Record<string, string>): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);

    this.addMetric({
      name,
      value: current + value,
      timestamp: Date.now(),
      labels: labels || {},
    });

    this.emit('counter', { name, value: current + value, labels });
  }

  // Set a gauge value
  gauge(name: string, value: number, labels?: Record<string, string>): void {
    this.gauges.set(name, value);

    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      labels: labels || {},
    });

    this.emit('gauge', { name, value, labels });
  }

  // Record a histogram value
  histogram(name: string, value: number, buckets?: number[], labels?: Record<string, string>): void {
    let hist = this.histograms.get(name);

    if (!hist) {
      const defaultBuckets = buckets || [0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000];
      hist = {
        name,
        count: 0,
        sum: 0,
        buckets: {},
      };

      // Initialize buckets
      for (const bucket of defaultBuckets) {
        hist.buckets[bucket] = 0;
      }

      this.histograms.set(name, hist);
    }

    hist.count++;
    hist.sum += value;

    // Update buckets
    for (const bucket of Object.keys(hist.buckets).map(Number).sort((a, b) => a - b)) {
      if (value <= bucket) {
        hist.buckets[bucket]++;
      }
    }

    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      labels: labels || {},
    });

    this.emit('histogram', { name, value, labels });
  }

  // Add metric to storage
  private addMetric(metric: Metric): void {
    this.metrics.push(metric);

    // Prevent unbounded growth
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Get all metrics
  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  // Get counter value
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  // Get gauge value
  getGauge(name: string): number | undefined {
    return this.gauges.get(name);
  }

  // Get histogram
  getHistogram(name: string): Histogram | undefined {
    return this.histograms.get(name);
  }

  // Calculate percentiles from histogram
  getPercentile(name: string, percentile: number): number {
    const hist = this.histograms.get(name);
    if (!hist || hist.count === 0) return 0;

    const count = Math.ceil(hist.count * (percentile / 100));
    let runningCount = 0;

    for (const bucket of Object.keys(hist.buckets).map(Number).sort((a, b) => a - b)) {
      runningCount += hist.buckets[bucket];
      if (runningCount >= count) {
        return bucket;
      }
    }

    return Infinity;
  }

  // Reset all metrics
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.metrics = [];
    this.emit('reset');
  }
}

// Global metrics collector
export const metrics = new MetricsCollector();

// ============================================================================
// DISTRIBUTED TRACING
// ============================================================================

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, string>;
  logs: Array<{ timestamp: number; message: string; level: string }>;
  status?: string;
}

class Tracer {
  private spans: Map<string, Span> = new Map();
  private currentSpan: Span | undefined;
  private maxSpans: number = 1000;

  // Start a new span
  startSpan(operation: string, tags?: Record<string, string>): Span {
    const spanId = this.generateId();
    const traceId = this.currentSpan ? this.currentSpan.traceId : this.generateId();

    const span: Span = {
      traceId,
      spanId,
      parentSpanId: this.currentSpan?.spanId,
      operation,
      startTime: Date.now(),
      tags: tags || {},
      logs: [],
    };

    this.spans.set(spanId, span);
    this.currentSpan = span;

    metrics.histogram('span_started', 1, undefined, { operation });

    return span;
  }

  // Finish a span
  finishSpan(status?: string): void {
    if (!this.currentSpan) return;

    this.currentSpan.endTime = Date.now();
    this.currentSpan.duration = this.currentSpan.endTime - this.currentSpan.startTime;
    this.currentSpan.status = status;

    metrics.histogram('span_duration_ms', this.currentSpan.duration, [1, 5, 10, 50, 100, 500, 1000, 5000], {
      operation: this.currentSpan.operation,
      status: status || 'success',
    });

    // Set parent as current
    if (this.currentSpan.parentSpanId) {
      const parent = this.spans.get(this.currentSpan.parentSpanId);
      this.currentSpan = parent;
    } else {
      this.currentSpan = undefined;
    }
  }

  // Add log to current span
  log(message: string, level: string = 'info'): void {
    if (!this.currentSpan) return;

    this.currentSpan.logs.push({
      timestamp: Date.now(),
      message,
      level,
    });
  }

  // Set tag on current span
  setTag(key: string, value: string): void {
    if (!this.currentSpan) return;
    this.currentSpan.tags[key] = value;
  }

  // Get span by ID
  getSpan(spanId: string): Span | undefined {
    return this.spans.get(spanId);
  }

  // Get all spans
  getSpans(): Span[] {
    return Array.from(this.spans.values());
  }

  // Generate random ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Clear old spans
  clear(): void {
    const now = Date.now();
    const oneHour = 3600000;

    for (const [id, span] of this.spans) {
      if (span.endTime && (now - span.endTime) > oneHour) {
        this.spans.delete(id);
      }
    }

    // Prevent unbounded growth
    if (this.spans.size > this.maxSpans) {
      const entries = Array.from(this.spans.entries()).slice(0, this.maxSpans);
      this.spans = new Map(entries);
    }
  }
}

// Global tracer
export const tracer = new Tracer();

// ============================================================================
// ERROR TRACKING
// ============================================================================

interface ErrorEvent {
  id: string;
  error: Error;
  timestamp: number;
  context?: {
    userId?: string;
    operation?: string;
    tags?: Record<string, string>;
    stack?: string;
  };
  handled: boolean;
  level: 'fatal' | 'error' | 'warning';
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxErrors: number = 1000;
  private errorCounts: Map<string, number> = new Map();

  // Track an error
  track(error: Error, context?: ErrorEvent['context'], level: ErrorEvent['level'] = 'error'): string {
    const id = this.generateId();
    const errorKey = `${error.name}:${error.message}`;

    // Count occurrences
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);

    const errorEvent: ErrorEvent = {
      id,
      error,
      timestamp: Date.now(),
      context,
      handled: true,
      level,
    };

    this.errors.push(errorEvent);

    // Update metrics
    metrics.increment('errors_total', 1, {
      error_name: error.name,
      error_level: level,
      handled: 'true',
    });

    this.emit('error', errorEvent);

    // Prevent unbounded growth
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    return id;
  }

  // Track fatal error
  fatal(error: Error, context?: ErrorEvent['context']): string {
    return this.track(error, context, 'fatal');
  }

  // Get recent errors
  getRecentErrors(limit: number = 100): ErrorEvent[] {
    return this.errors.slice(-limit);
  }

  // Get error count for specific error type
  getErrorCount(errorName: string, errorMessage?: string): number {
    if (errorMessage) {
      return this.errorCounts.get(`${errorName}:${errorMessage}`) || 0;
    }
    return this.errorCounts.get(`${errorName}:`) || 0;
  }

  // Clear old errors
  clear(): void {
    const now = Date.now();
    const oneDay = 86400000;

    this.errors = this.errors.filter(e => (now - e.timestamp) < oneDay);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private emit(event: string, data: unknown): void {
    // In production, send to error tracking service
    console.log(`[ERROR_TRACKER] ${event}:`, data);
  }
}

// Global error tracker
export const errorTracker = new ErrorTracker();

// Setup global error handlers
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (error) => {
    errorTracker.fatal(error, { context: { handled: false } });
    console.error('Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    errorTracker.track(error, { context: { handled: false, type: 'unhandledRejection' } });
    console.error('Unhandled Rejection at:', promise, 'reason:', error);
  });
}

// ============================================================================
// ALERTING SYSTEM
// ============================================================================

interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
  labels: Record<string, string>;
  source: string;
}

interface AlertRule {
  name: string;
  condition: () => boolean;
  severity: Alert['severity'];
  title: string;
  description: string;
  cooldown: number; // milliseconds
  lastTriggered?: number;
}

class Alerter {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private maxAlerts: number = 1000;

  // Add an alert rule
  addRule(rule: Omit<AlertRule, 'lastTriggered'>): void {
    this.rules.push({ ...rule, lastTriggered: undefined });
  }

  // Check all rules and trigger alerts
  checkRules(): void {
    const now = Date.now();

    for (const rule of this.rules) {
      // Check cooldown
      if (rule.lastTriggered && (now - rule.lastTriggered < rule.cooldown)) {
        continue;
      }

      // Check condition
      if (rule.condition()) {
        this.createAlert({
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          labels: { rule: rule.name },
          source: 'rule',
        });

        rule.lastTriggered = now;
      }
    }
  }

  // Create an alert
  createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: Alert = {
      ...alert,
      id: this.generateId(),
      timestamp: Date.now(),
      resolved: false,
    };

    this.alerts.push(newAlert);

    metrics.increment('alerts_total', 1, {
      severity: alert.severity,
      source: alert.source,
    });

    this.emit('alert', newAlert);

    // Prevent unbounded growth
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }
  }

  // Resolve an alert
  resolve(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();

      metrics.increment('alerts_resolved', 1, { severity: alert.severity });
    }
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  // Get all alerts
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  // Clear old resolved alerts
  clear(): void {
    const now = Date.now();
    const oneWeek = 604800000;

    this.alerts = this.alerts.filter(a => {
      if (a.resolved && a.resolvedAt && (now - a.resolvedAt) > oneWeek) {
        return false;
      }
      return true;
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private emit(event: string, data: unknown): void {
    // In production, send to alerting service (PagerDuty, Slack, etc.)
    console.log(`[ALERTER] ${event}:`, data);
  }
}

// Global alerter
export const alerter = new Alerter();

// Setup default alerting rules
alerter.addRule({
  name: 'high_error_rate',
  condition: () => {
    const errors = metrics.getCounter('errors_total');
    const requests = metrics.getCounter('requests_total');
    return requests > 0 && (errors / requests) > 0.05; // 5% error rate
  },
  severity: 'high',
  title: 'High Error Rate',
  description: 'Error rate exceeds 5%',
  cooldown: 300000, // 5 minutes
});

alerter.addRule({
  name: 'slow_requests',
  condition: () => {
    const p95 = metrics.getPercentile('request_duration_ms', 95);
    return p95 > 5000; // 5 seconds
  },
  severity: 'medium',
  title: 'Slow Requests',
  description: '95th percentile request duration exceeds 5 seconds',
  cooldown: 300000,
});

alerter.addRule({
  name: 'cache_hit_rate_low',
  condition: () => {
    const hits = metrics.getCounter('cache_hits_total');
    const misses = metrics.getCounter('cache_misses_total');
    const total = hits + misses;
    return total > 100 && (hits / total) < 0.5; // Less than 50% hit rate
  },
  severity: 'low',
  title: 'Low Cache Hit Rate',
  description: 'Cache hit rate below 50%',
  cooldown: 600000, // 10 minutes
});

// ============================================================================
// HEALTH CHECKS
// ============================================================================

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: number;
  duration?: number;
}

class HealthChecker {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();

  // Register a health check
  register(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }

  // Run all health checks
  async checkAll(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];

    for (const [name, check] of this.checks) {
      try {
        const start = Date.now();
        const result = await check();
        result.duration = Date.now() - start;
        results.push(result);
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          message: (error as Error).message,
          timestamp: Date.now(),
        });
      }
    }

    return results;
  }

  // Get overall health status
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    timestamp: number;
  }> {
    const checks = await this.checkAll();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    for (const check of checks) {
      if (check.status === 'unhealthy') {
        status = 'unhealthy';
        break;
      } else if (check.status === 'degraded' && status !== 'unhealthy') {
        status = 'degraded';
      }
    }

    return {
      status,
      checks,
      timestamp: Date.now(),
    };
  }
}

// Global health checker
export const healthChecker = new HealthChecker();

// Setup default health checks
healthChecker.register('memory', async () => {
  const memUsage = process.memoryUsage();
  const heapUsed = memUsage.heapUsed / memUsage.heapTotal;

  if (heapUsed > 0.9) {
    return {
      name: 'memory',
      status: 'unhealthy',
      message: `Heap usage at ${(heapUsed * 100).toFixed(1)}%`,
      timestamp: Date.now(),
    };
  } else if (heapUsed > 0.7) {
    return {
      name: 'memory',
      status: 'degraded',
      message: `Heap usage at ${(heapUsed * 100).toFixed(1)}%`,
      timestamp: Date.now(),
    };
  }

  return {
    name: 'memory',
    status: 'healthy',
    message: `Heap usage at ${(heapUsed * 100).toFixed(1)}%`,
    timestamp: Date.now(),
  };
});

healthChecker.register('metrics', async () => {
  const metricsCount = metrics.getMetrics().length;
  const errorCount = errorTracker.getRecentErrors().length;

  if (errorCount > 100) {
    return {
      name: 'metrics',
      status: 'degraded',
      message: `High error count: ${errorCount}`,
      timestamp: Date.now(),
    };
  }

  return {
    name: 'metrics',
    status: 'healthy',
    message: `Metrics: ${metricsCount}, Errors: ${errorCount}`,
    timestamp: Date.now(),
  };
});

// ============================================================================
// MONITORING TASKS
// ============================================================================

// Start periodic monitoring tasks
export function startMonitoring(intervalMs: number = 60000): void {
  // Check alerting rules
  setInterval(() => {
    alerter.checkRules();
  }, intervalMs);

  // Clear old data
  setInterval(() => {
    tracer.clear();
    errorTracker.clear();
    alerter.clear();
  }, intervalMs * 10); // Less frequent cleanup

  // Record system metrics
  setInterval(() => {
    const memUsage = process.memoryUsage();
    metrics.gauge('memory_heap_used_bytes', memUsage.heapUsed);
    metrics.gauge('memory_heap_total_bytes', memUsage.heapTotal);
    metrics.gauge('memory_external_bytes', memUsage.external);
  }, intervalMs);

  metrics.increment('monitoring_started');
}

// Export health endpoint handler (for web frameworks)
export async function healthHandler(): Promise<{
  status: number;
  body: string;
}> {
  const health = await healthChecker.getHealth();
  const status = health.status === 'unhealthy' ? 503 : health.status === 'degraded' ? 200 : 200;

  return {
    status,
    body: JSON.stringify(health, null, 2),
  };
}

// Export metrics endpoint handler (Prometheus format)
export function metricsHandler(): string {
  const lines: string[] = [];

  // Counters
  for (const [name, value] of metrics.getMetrics()) {
    lines.push(`# HELP ${name} ${name}`);
    lines.push(`# TYPE ${name} counter`);
    lines.push(`${name} ${value}`);
  }

  // Gauges
  for (const [name, value] of metrics.getMetrics()) {
    lines.push(`# HELP ${name} ${name}`);
    lines.push(`# TYPE ${name} gauge`);
    lines.push(`${name} ${value}`);
  }

  return lines.join('\n');
}
