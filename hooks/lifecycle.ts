/**
 * Lifecycle hooks for agent and skill execution
 *
 * This module provides a comprehensive hook system for:
 * - Pre-execution validation and setup
 * - Post-execution cleanup and validation
 * - Error handling and recovery
 * - State synchronization between agents
 */

import { EventEmitter } from 'events';

// Hook execution context
export interface HookContext {
  agentId: string;
  skillId: string;
  timestamp: number;
  input: unknown;
  metadata: Record<string, unknown>;
}

// Hook result
export interface HookResult {
  success: boolean;
  data?: unknown;
  error?: Error;
  shouldContinue: boolean;
}

// Hook definition
export interface Hook {
  name: string;
  priority: number;
  execute: (context: HookContext) => Promise<HookResult>;
}

// Hook types
export enum HookType {
  PRE_EXECUTION = 'pre_execution',
  POST_EXECUTION = 'post_execution',
  PRE_VALIDATION = 'pre_validation',
  POST_VALIDATION = 'post_validation',
  ON_ERROR = 'on_error',
  ON_TIMEOUT = 'on_timeout',
  STATE_SYNC = 'state_sync',
}

// Hook registry class
export class HookRegistry extends EventEmitter {
  private hooks: Map<HookType, Set<Hook>> = new Map();
  private hookHistory: Array<{ type: HookType; hook: Hook; context: HookContext; result: HookResult }> = [];

  /**
   * Register a hook for a specific type
   */
  public registerHook(type: HookType, hook: Hook): void {
    if (!this.hooks.has(type)) {
      this.hooks.set(type, new Set());
    }
    this.hooks.get(type)!.add(hook);
    this.emit('hook_registered', { type, hook });
  }

  /**
   * Unregister a hook
   */
  public unregisterHook(type: HookType, hookName: string): boolean {
    const hooks = this.hooks.get(type);
    if (!hooks) return false;

    for (const hook of hooks) {
      if (hook.name === hookName) {
        hooks.delete(hook);
        this.emit('hook_unregistered', { type, hookName });
        return true;
      }
    }
    return false;
  }

  /**
   * Execute all hooks for a specific type in priority order
   */
  public async executeHooks(type: HookType, context: HookContext): Promise<HookResult[]> {
    const hooks = this.hooks.get(type);
    if (!hooks || hooks.size === 0) {
      return [];
    }

    // Sort hooks by priority (higher priority first)
    const sortedHooks = Array.from(hooks).sort((a, b) => b.priority - a.priority);
    const results: HookResult[] = [];

    for (const hook of sortedHooks) {
      try {
        const result = await hook.execute(context);
        results.push(result);
        this.hookHistory.push({ type, hook, context, result });

        // If hook indicates we should stop, return early
        if (!result.shouldContinue) {
          this.emit('execution_stopped', { type, hook, context });
          break;
        }
      } catch (error) {
        const errorResult: HookResult = {
          success: false,
          error: error as Error,
          shouldContinue: true,
        };
        results.push(errorResult);
        this.hookHistory.push({ type, hook, context, result: errorResult });
      }
    }

    return results;
  }

  /**
   * Get hook execution history
   */
  public getHookHistory(limit?: number): typeof this.hookHistory {
    if (limit) {
      return this.hookHistory.slice(-limit);
    }
    return [...this.hookHistory];
  }

  /**
   * Clear hook history
   */
  public clearHistory(): void {
    this.hookHistory = [];
  }

  /**
   * Get all registered hooks for a type
   */
  public getHooks(type: HookType): Hook[] {
    const hooks = this.hooks.get(type);
    return hooks ? Array.from(hooks) : [];
  }

  /**
   * Check if a hook is registered
   */
  public hasHook(type: HookType, hookName: string): boolean {
    const hooks = this.hooks.get(type);
    if (!hooks) return false;

    for (const hook of hooks) {
      if (hook.name === hookName) {
        return true;
      }
    }
    return false;
  }
}

// Global hook registry instance
export const hookRegistry = new HookRegistry();

// Predefined hooks for common scenarios

/**
 * Weapon exclusion hook - ensures no weapons/violence content
 */
export const weaponExclusionHook: Hook = {
  name: 'weapon_exclusion',
  priority: 1000,
  execute: async (context: HookContext): Promise<HookResult> => {
    const input = context.input as string;

    // Check for weapons/violence related keywords
    const prohibitedKeywords = [
      'weapon', 'gun', 'firearm', 'ammo', 'explosive', 'bomb',
      'violence', 'attack', 'combat', 'military', 'tactical',
    ];

    const lowerInput = input.toLowerCase();
    const foundKeywords = prohibitedKeywords.filter(kw => lowerInput.includes(kw));

    if (foundKeywords.length > 0) {
      return {
        success: false,
        error: new Error(`Prohibited content detected: ${foundKeywords.join(', ')}. This skill excludes weapons and violence-related content.`),
        shouldContinue: false,
      };
    }

    return { success: true, shouldContinue: true };
  },
};

/**
 * Disclaimer injection hook - ensures disclaimers are present
 */
export const disclaimerInjectionHook: Hook = {
  name: 'disclaimer_injection',
  priority: 900,
  execute: async (context: HookContext): Promise<HookResult> => {
    const output = context.metadata?.output as string;

    if (!output) {
      return { success: true, shouldContinue: true };
    }

    // Check if disclaimer is present
    const disclaimerText = 'This skill provides general, educational/analytical information only';
    if (!output.toLowerCase().includes(disclaimerText.toLowerCase())) {
      return {
        success: false,
        error: new Error('Disclaimer not present in output'),
        shouldContinue: false,
      };
    }

    return { success: true, shouldContinue: true };
  },
};

/**
 * Input validation hook
 */
export const inputValidationHook: Hook = {
  name: 'input_validation',
  priority: 800,
  execute: async (context: HookContext): Promise<HookResult> => {
    const input = context.input as string;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return {
        success: false,
        error: new Error('Input must be a non-empty string'),
        shouldContinue: false,
      };
    }

    if (input.length > 50000) {
      return {
        success: false,
        error: new Error('Input exceeds maximum length of 50000 characters'),
        shouldContinue: false,
      };
    }

    return { success: true, shouldContinue: true };
  },
};

/**
 * Context size monitoring hook
 */
export const contextSizeMonitoringHook: Hook = {
  name: 'context_size_monitoring',
  priority: 700,
  execute: async (context: HookContext): Promise<HookResult> => {
    const contextSize = JSON.stringify(context).length;

    // Warn if context is getting large (but allow it)
    if (contextSize > 100000) {
      console.warn(`Large context detected: ${contextSize} characters`);
    }

    return { success: true, shouldContinue: true };
  },
};

/**
 * Register default hooks
 */
export function registerDefaultHooks(): void {
  hookRegistry.registerHook(HookType.PRE_VALIDATION, weaponExclusionHook);
  hookRegistry.registerHook(HookType.PRE_VALIDATION, inputValidationHook);
  hookRegistry.registerHook(HookType.POST_VALIDATION, disclaimerInjectionHook);
  hookRegistry.registerHook(HookType.PRE_EXECUTION, contextSizeMonitoringHook);
}

// Initialize with default hooks
registerDefaultHooks();
