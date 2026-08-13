/**
 * Monitoring Dashboard Configuration
 * Defines metrics, alerts, and dashboards for observability
 */

export const dashboardConfig = {
  // Main dashboard
  overview: {
    title: 'Survival Preparedness Strategist - Overview',
    panels: [
      {
        title: 'Request Rate',
        type: 'graph',
        targets: [
          {
            expr: 'rate(requests_total[5m])',
            legendFormat: '{{method}} {{status}}',
          },
        ],
      },
      {
        title: 'Error Rate',
        type: 'graph',
        targets: [
          {
            expr: 'rate(errors_total[5m]) / rate(requests_total[5m])',
            legendFormat: '{{error_name}}',
          },
        ],
      },
      {
        title: 'Response Time (95th percentile)',
        type: 'graph',
        targets: [
          {
            expr: 'histogram_quantile(0.95, rate(request_duration_ms_bucket[5m]))',
            legendFormat: '{{operation}}',
          },
        ],
      },
      {
        title: 'Cache Performance',
        type: 'graph',
        targets: [
          {
            expr: 'rate(cache_hits_total[5m]) / rate(cache_requests_total[5m])',
            legendFormat: 'Hit Rate',
          },
        ],
      },
      {
        title: 'Active Alerts',
        type: 'stat',
        targets: [
          {
            expr: 'count(alerts_total{resolved="false"})',
            legendFormat: 'Active Alerts',
          },
        ],
      },
      {
        title: 'Tool Usage',
        type: 'piechart',
        targets: [
          {
            expr: 'topk(10, sum(tool_invocations_total) by (tool_name))',
            legendFormat: '{{tool_name}}',
          },
        ],
      },
    ],
  },

  // Tool performance dashboard
  tools: {
    title: 'Tool Performance',
    panels: [
      {
        title: 'Tool Execution Time',
        type: 'graph',
        targets: [
          {
            expr: 'histogram_quantile(0.95, rate(tool_execution_duration_ms_bucket[5m]))',
            legendFormat: '{{tool_name}}',
          },
        ],
      },
      {
        title: 'Tool Success Rate',
        type: 'graph',
        targets: [
          {
            expr: 'rate(tool_invocations_total{status="success"}[5m]) / rate(tool_invocations_total[5m])',
            legendFormat: '{{tool_name}}',
          },
        ],
      },
      {
        title: 'Cache Effectiveness by Tool',
        type: 'heatmap',
        targets: [
          {
            expr: 'rate(cache_hits_total[5m]) by (tool_name) / rate(cache_requests_total[5m]) by (tool_name)',
            legendFormat: '{{tool_name}}',
          },
        ],
      },
    ],
  },

  // Safety dashboard
  safety: {
    title: 'Safety and Guardrails',
    panels: [
      {
        title: 'Weapon Exclusion Triggers',
        type: 'stat',
        targets: [
          {
            expr: 'sum(weapon_exclusion_triggered_total)',
            legendFormat: 'Triggers',
          },
        ],
      },
      {
        title: 'Disclaimer Injection Rate',
        type: 'gauge',
        targets: [
          {
            expr: 'rate(disclaimer_injected_total[5m]) / rate(requests_total[5m])',
            legendFormat: 'Injection Rate',
          },
        ],
      },
      {
        title: 'Professional Consultation Referrals',
        type: 'graph',
        targets: [
          {
            expr: 'rate(professional_referral_total[5m])',
            legendFormat: '{{referral_type}}',
          },
        ],
      },
      {
        title: 'Safety Test Pass Rate',
        type: 'gauge',
        targets: [
          {
            expr: 'safety_test_pass_rate',
            legendFormat: 'Pass Rate',
          },
        ],
      },
    ],
  },

  // Research accuracy dashboard
  research: {
    title: 'Research Integration Accuracy',
    panels: [
      {
        title: 'Citation Accuracy',
        type: 'gauge',
        targets: [
          {
            expr: 'citation_accuracy_score',
            legendFormat: 'Accuracy Score',
          },
        ],
      },
      {
        title: 'Research Coverage',
        type: 'piechart',
        targets: [
          {
            expr: 'count(research_cited_total) by (domain)',
            legendFormat: '{{domain}}',
          },
        ],
      },
      {
        title: 'Effect Size Usage',
        type: 'table',
        targets: [
          {
            expr: 'research_effect_size_used',
            legendFormat: '{{paper_id}}',
          },
        ],
      },
    ],
  },
};

// Alert rules
export const alertRules = [
  {
    name: 'HighErrorRate',
    condition: 'rate(errors_total[5m]) / rate(requests_total[5m]) > 0.05',
    severity: 'critical',
    message: 'Error rate exceeds 5%',
    annotations: {
      summary: 'High error rate detected',
      description: 'The error rate has exceeded 5% in the last 5 minutes',
    },
  },
  {
    name: 'SlowResponseTime',
    condition: 'histogram_quantile(0.95, rate(request_duration_ms_bucket[5m])) > 5000',
    severity: 'warning',
    message: '95th percentile response time exceeds 5 seconds',
    annotations: {
      summary: 'Slow response times',
      description: 'The 95th percentile response time is above 5 seconds',
    },
  },
  {
    name: 'LowCacheHitRate',
    condition: 'rate(cache_hits_total[5m]) / rate(cache_requests_total[5m]) < 0.5',
    severity: 'info',
    message: 'Cache hit rate below 50%',
    annotations: {
      summary: 'Low cache hit rate',
      description: 'Cache hit rate has dropped below 50% in the last 5 minutes',
    },
  },
  {
    name: 'HighMemoryUsage',
    condition: 'process_resident_memory_bytes / total_memory_available > 0.9',
    severity: 'critical',
    message: 'Memory usage exceeds 90%',
    annotations: {
      summary: 'High memory usage',
      description: 'Process memory usage has exceeded 90% of available memory',
    },
  },
  {
    name: 'WeaponExclusionTriggered',
    condition: 'rate(weapon_exclusion_triggered_total[1m]) > 0',
    severity: 'critical',
    message: 'Weapon exclusion hook triggered',
    annotations: {
      summary: 'Weapon content detected',
      description: 'The weapon exclusion hook has been triggered, indicating potential policy violation',
    },
  },
  {
    name: 'DisclaimerMissed',
    condition: 'rate(disclaimer_missed_total[5m]) > 0',
    severity: 'critical',
    message: 'Disclaimer not injected in response',
    annotations: {
      summary: 'Disclaimer missed',
      description: 'A response was generated without the required disclaimer',
    },
  },
];

// Recording rules
export const recordingRules = [
  {
    name: 'request_rate',
    expr: 'rate(requests_total[5m])',
    labels: ['method', 'status'],
  },
  {
    name: 'error_rate',
    expr: 'rate(errors_total[5m]) / rate(requests_total[5m])',
    labels: ['error_name'],
  },
  {
    name: 'p95_response_time',
    expr: 'histogram_quantile(0.95, rate(request_duration_ms_bucket[5m]))',
    labels: ['operation'],
  },
  {
    name: 'cache_hit_rate',
    expr: 'rate(cache_hits_total[5m]) / rate(cache_requests_total[5m])',
    labels: ['cache_type'],
  },
  {
    name: 'tool_success_rate',
    expr: 'rate(tool_invocations_total{status="success"}[5m]) / rate(tool_invocations_total[5m])',
    labels: ['tool_name'],
  },
];
