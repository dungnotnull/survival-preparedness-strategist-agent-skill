/**
 * Type-safe configuration management for Global Crisis & Survival Preparedness Strategist
 *
 * This module provides centralized configuration for:
 * - Environment variables with validation
 * - LLM parameters and model settings
 * - Feature flags and system behavior
 * - Agent routing and skill selection
 */

// Type definitions for configuration values
export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  retryAttempts: number;
}

export interface AgentConfig {
  maxConcurrentAgents: number;
  agentTimeout: number;
  contextWindowSize: number;
  enableStreaming: boolean;
}

export interface FeatureFlags {
  enablePandemicModule: boolean;
  enableFirstAidModule: boolean;
  enableCommunityResilience: boolean;
  enablePsychologicalSupport: boolean;
  strictWeaponExclusion: boolean;
  requireDisclaimer: boolean;
}

export interface SkillRegistryConfig {
  skillResolutionTimeout: number;
  maxSkillDepth: number;
  enableSkillCaching: boolean;
  cacheTimeout: number;
}

// Main configuration interface
export interface Config {
  llm: LLMConfig;
  agents: AgentConfig;
  features: FeatureFlags;
  skillRegistry: SkillRegistryConfig;
}

// Default configuration values
const DEFAULT_CONFIG: Config = {
  llm: {
    model: process.env.LLM_MODEL || 'claude-sonnet-4-6',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.3'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '8192'),
    timeout: parseInt(process.env.LLM_TIMEOUT || '120000'),
    retryAttempts: parseInt(process.env.LLM_RETRY_ATTEMPTS || '3'),
  },
  agents: {
    maxConcurrentAgents: parseInt(process.env.MAX_CONCURRENT_AGENTS || '5'),
    agentTimeout: parseInt(process.env.AGENT_TIMEOUT || '300000'),
    contextWindowSize: parseInt(process.env.CONTEXT_WINDOW_SIZE || '200000'),
    enableStreaming: process.env.ENABLE_STREAMING !== 'false',
  },
  features: {
    enablePandemicModule: process.env.ENABLE_PANDEMIC_MODULE !== 'false',
    enableFirstAidModule: process.env.ENABLE_FIRST_AID_MODULE !== 'false',
    enableCommunityResilience: process.env.ENABLE_COMMUNITY_RESILIENCE !== 'false',
    enablePsychologicalSupport: process.env.ENABLE_PSYCHOLOGICAL_SUPPORT !== 'false',
    strictWeaponExclusion: true,
    requireDisclaimer: true,
  },
  skillRegistry: {
    skillResolutionTimeout: parseInt(process.env.SKILL_RESOLUTION_TIMEOUT || '5000'),
    maxSkillDepth: parseInt(process.env.MAX_SKILL_DEPTH || '3'),
    enableSkillCaching: process.env.ENABLE_SKILL_CACHING !== 'false',
    cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '3600000'),
  },
};

// Configuration validation
function validateConfig(config: Config): void {
  // Validate LLM config
  if (config.llm.temperature < 0 || config.llm.temperature > 1) {
    throw new Error(`LLM temperature must be between 0 and 1, got ${config.llm.temperature}`);
  }
  if (config.llm.maxTokens < 1 || config.llm.maxTokens > 200000) {
    throw new Error(`LLM maxTokens must be between 1 and 200000, got ${config.llm.maxTokens}`);
  }
  if (config.llm.retryAttempts < 0 || config.llm.retryAttempts > 10) {
    throw new Error(`LLM retryAttempts must be between 0 and 10, got ${config.llm.retryAttempts}`);
  }

  // Validate agent config
  if (config.agents.maxConcurrentAgents < 1 || config.agents.maxConcurrentAgents > 20) {
    throw new Error(`maxConcurrentAgents must be between 1 and 20, got ${config.agents.maxConcurrentAgents}`);
  }
  if (config.agents.contextWindowSize < 1000 || config.agents.contextWindowSize > 2000000) {
    throw new Error(`contextWindowSize must be between 1000 and 2000000, got ${config.agents.contextWindowSize}`);
  }

  // Validate feature flags
  if (typeof config.features.strictWeaponExclusion !== 'boolean') {
    throw new Error('strictWeaponExclusion must be a boolean');
  }
  if (typeof config.features.requireDisclaimer !== 'boolean') {
    throw new Error('requireDisclaimer must be a boolean');
  }
}

// Configuration singleton
class ConfigurationManager {
  private config: Config;
  private initialized: boolean = false;

  constructor(customConfig?: Partial<Config>) {
    this.config = { ...DEFAULT_CONFIG, ...this.mergeCustomConfig(customConfig) };
  }

  private mergeCustomConfig(customConfig?: Partial<Config>): Partial<Config> {
    if (!customConfig) return {};

    const merged: Partial<Config> = {};

    if (customConfig.llm) {
      merged.llm = { ...DEFAULT_CONFIG.llm, ...customConfig.llm };
    }
    if (customConfig.agents) {
      merged.agents = { ...DEFAULT_CONFIG.agents, ...customConfig.agents };
    }
    if (customConfig.features) {
      merged.features = { ...DEFAULT_CONFIG.features, ...customConfig.features };
    }
    if (customConfig.skillRegistry) {
      merged.skillRegistry = { ...DEFAULT_CONFIG.skillRegistry, ...customConfig.skillRegistry };
    }

    return merged;
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    validateConfig(this.config);
    this.initialized = true;
  }

  public getConfig(): Config {
    if (!this.initialized) {
      throw new Error('Configuration not initialized. Call initialize() first.');
    }
    return { ...this.config };
  }

  public getLLMConfig(): LLMConfig {
    this.ensureInitialized();
    return { ...this.config.llm };
  }

  public getAgentConfig(): AgentConfig {
    this.ensureInitialized();
    return { ...this.config.agents };
  }

  public getFeatureFlags(): FeatureFlags {
    this.ensureInitialized();
    return { ...this.config.features };
  }

  public getSkillRegistryConfig(): SkillRegistryConfig {
    this.ensureInitialized();
    return { ...this.config.skillRegistry };
  }

  public updateConfig(updates: Partial<Config>): void {
    this.config = this.mergeCustomConfig(updates) as Config;
    validateConfig(this.config);
  }

  public resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
    validateConfig(this.config);
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Configuration not initialized. Call initialize() first.');
    }
  }
}

// Export singleton instance
export const configManager = new ConfigurationManager();

// Initialize on import
configManager.initialize();

// Export convenience function for getting config
export function getConfig(): Config {
  return configManager.getConfig();
}

export function getLLMConfig(): LLMConfig {
  return configManager.getLLMConfig();
}

export function getAgentConfig(): AgentConfig {
  return configManager.getAgentConfig();
}

export function getFeatureFlags(): FeatureFlags {
  return configManager.getFeatureFlags();
}

export function getSkillRegistryConfig(): SkillRegistryConfig {
  return configManager.getSkillRegistryConfig();
}
