# PRODUCTION-DEPLOYMENT.md — Complete Production Deployment Guide

## Deployment Status: ✅ PRODUCTION-GRADE

This document provides complete production deployment instructions and configuration for the Survival Preparedness Strategist system.

---

## Quick Start Deployment

### 1. Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd survival-preparedness-strategist

# Install dependencies
bun install

# Setup environment
cp config/.env.example .env
# Edit .env with production values

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Validate configuration
node scripts/validate.ts
```

### 2. Environment Variables

**Required Variables:**
```bash
# LLM Configuration
ANTHROPIC_API_KEY=your_api_key_here
LLM_MODEL=claude-sonnet-4-6
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=8192

# Application Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

**Optional Variables:**
```bash
# Performance Tuning
MAX_CONCURRENT_AGENTS=5
AGENT_TIMEOUT=300000
ENABLE_STREAMING=true

# Feature Flags
ENABLE_PANDEMIC_MODULE=true
ENABLE_FIRST_AID_MODULE=true
ENABLE_COMMUNITY_RESILIENCE=true
ENABLE_PSYCHOLOGICAL_SUPPORT=true

# Monitoring
ENABLE_METRICS=true
ENABLE_TRACING=true
SENTRY_DSN=your_sentry_dsn_here
```

### 3. Build and Deploy

```bash
# Build project
bun run build

# Run tests
bun test

# Start production server
bun run start
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build project
RUN bun run build

# Production image
FROM oven/bun:1 AS production
WORKDIR /app
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/dist /app/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { if (r.statusCode !== 200) throw new Error('Health check failed') })"

# Start server
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - LLM_MODEL=${LLM_MODEL:-claude-sonnet-4-6}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
    depends_on:
      redis:
        condition: service_healthy

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    volumes:
      - redis_data:/data

  monitoring:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

volumes:
  redis_data:
  prometheus_data:
  grafana_data:
```

---

## Kubernetes Deployment

### Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: survival-strategist
  labels:
    name: survival-strategist
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: survival-strategist
  namespace: survival-strategist
spec:
  replicas: 3
  selector:
    matchLabels:
      app: survival-strategist
  template:
    metadata:
      labels:
        app: survival-strategist
    spec:
      containers:
      - name: app
        image: survival-strategist:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: anthropic-api-key
        - name: LLM_MODEL
          value: "claude-sonnet-4-6"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: survival-strategist
  namespace: survival-strategist
spec:
  selector:
    app: survival-strategist
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: v1
kind: Secret
metadata:
  name: api-keys
  namespace: survival-strategist
type: Opaque
stringData:
  anthropic-api-key: <your-api-key>
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: survival-strategist-hpa
  namespace: survival-strategist
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: survival-strategist
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
    target:
      type: Utilization
      averageUtilization: 70
  - type: Resource
    resource:
      name: memory
    target:
      type: Utilization
      averageUtilization: 80
```

---

## Monitoring and Observability

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'survival-strategist'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - survival-strategist
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_name]
        regex: (.+)
        target_label: pod
```

### Grafana Dashboards

The system includes pre-configured Grafana dashboards:

1. **Overview Dashboard** - System-wide metrics
2. **Tool Performance Dashboard** - Tool execution metrics
3. **Safety Dashboard** - Guardrail compliance metrics
4. **Research Accuracy Dashboard** - Research integration metrics

Access dashboards at `http://localhost:3001` (default credentials: admin/admin)

---

## Security Considerations

### 1. Network Security

- ✅ HTTPS only in production
- ✅ TLS 1.2+ required
- ✅ HSTS enabled
- ✅ Secure headers configured

### 2. Application Security

- ✅ Input validation and sanitization
- ✅ Output encoding
- ✅ XSS prevention
- ✅ SQL injection prevention
- ✅ Path traversal prevention
- ✅ Command injection prevention
- ✅ Rate limiting implemented

### 3. Data Security

- ✅ PII excluded from logs
- ✅ Secrets management
- ✅ Secure session management
- ✅ Secure cookie flags
- ✅ Encrypted data in transit

### 4. Specialized Security

- ✅ Weapon/violence content exclusion
- ✅ Mandatory disclaimer injection
- ✅ Professional consultation guidance
- ✅ Research-based validation

---

## Performance Configuration

### Recommended Production Settings

```typescript
// config/settings.ts
{
  llm: {
    model: 'claude-sonnet-4-6',
    temperature: 0.3,
    maxTokens: 8192,
    timeout: 120000,
    retryAttempts: 3,
  },
  agents: {
    maxConcurrentAgents: 5,
    agentTimeout: 300000,
    contextWindowSize: 200000,
    enableStreaming: false, // Disable for simpler error handling
  },
  features: {
    enablePandemicModule: true,
    enableFirstAidModule: true,
    enableCommunityResilience: true,
    enablePsychologicalSupport: true,
    strictWeaponExclusion: true,
    requireDisclaimer: true,
  },
  skillRegistry: {
    skillResolutionTimeout: 5000,
    maxSkillDepth: 3,
    enableSkillCaching: true,
    cacheTimeout: 3600000,
  },
}
```

### Cache Configuration

```typescript
// For high-traffic deployments
{
  responseCache: {
    maxSize: 100 * 1024 * 1024, // 100MB
    defaultTTL: 3600000, // 1 hour
  },
  toolCache: {
    maxSize: 50 * 1024 * 1024, // 50MB
    defaultTTL: 1800000, // 30 minutes
  },
  referenceCache: {
    maxSize: 30 * 1024 * 1024, // 30MB
    defaultTTL: 7200000, // 2 hours
  },
}
```

---

## Scaling Recommendations

### Horizontal Scaling

**Minimum:**
- 3 instances (for high availability)
- Load balancer configured
- Redis cache shared across instances

**Recommended for moderate load:**
- 5 instances
- Redis cluster
- Database read replicas

**Recommended for high load:**
- 10+ instances
- Redis cluster
- Database sharding
- CDN for static assets

### Vertical Scaling

**Minimum per instance:**
- 2 CPU cores
- 512MB RAM
- 10GB disk space

**Recommended per instance:**
- 4 CPU cores
- 1GB RAM
- 20GB disk space

**Optimal per instance:**
- 8 CPU cores
- 2GB RAM
- 50GB disk space

---

## Backup and Recovery

### Backup Strategy

**What to backup:**
1. Source code (Git)
2. Configuration files
3. Database data (if using)
4. Redis cache data
5. Application logs
6. Monitoring data

**Backup frequency:**
- Source code: Continuous (Git)
- Configuration: On change
- Data: Daily
- Logs: Weekly
- Monitoring: Monthly

**Backup locations:**
- Primary: Same region
- Secondary: Different region
- Tertiary: Offline storage

---

## Rollback Procedure

### Automated Rollback

The CI/CD pipeline includes automatic rollback on deployment failure:

```bash
# Manual rollback to previous version
git revert HEAD
git push
```

### Database Rollback (if applicable)

```bash
# Rollback migrations
bun run rollback:last
```

---

## Maintenance Procedures

### Routine Maintenance

**Daily:**
- Monitor error rates
- Check alerting systems
- Review performance metrics

**Weekly:**
- Review logs for unusual patterns
- Check dependency updates
- Review security alerts

**Monthly:**
- Run security audit
- Review and update dependencies
- Review performance trends
- Review cost optimization

**Quarterly:**
- Comprehensive security review
- Performance optimization review
- Cost optimization
- Disaster recovery testing

---

## Troubleshooting

### Common Issues

**1. High Error Rate**
- Check LLM API key and rate limits
- Review error logs for patterns
- Check if recent changes introduced issues

**2. Slow Response Times**
- Check cache hit rates
- Review LLM response times
- Check for memory issues
- Review concurrent request count

**3. High Memory Usage**
- Check for memory leaks
- Review cache size limits
- Check context window usage
- Restart instances if needed

**4. Cache Issues**
- Clear cache if stale data detected
- Review cache hit rates
- Check cache TTL settings
- Review cache key patterns

---

## Contact and Support

For deployment issues:
- Check logs: `logs/survival-strategist.log`
- Run diagnostics: `bun run diagnose`
- Check health: `curl http://localhost:3000/health`

For security issues:
- Follow security incident response plan
- Review security audit reports
- Contact security team

---

**Deployment Guide Version:** 1.0
**Last Updated:** 2026-08-05
**Production Status:** ✅ Ready for production deployment
