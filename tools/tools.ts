/**
 * Tool definitions and execution handlers for Survival Preparedness Strategist
 *
 * This module provides:
 * - JSON schemas for tool inputs/outputs
 * - Execution handlers for each tool
 * - Tool registration and resolution
 * - Error handling and validation
 */

import { getConfig } from '../config/settings.js';

// Tool execution context
export interface ToolExecutionContext {
  toolName: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

// Tool execution result
export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

// Tool definition
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  handler: (input: unknown, context: ToolExecutionContext) => Promise<ToolExecutionResult>;
  category: ToolCategory;
}

// JSON Schema types (simplified)
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: string[];
  description?: string;
}

// Tool categories
export enum ToolCategory {
  PREPAREDNESS_PLANNING = 'preparedness_planning',
  WATER_FOOD = 'water_food',
  FIRST_AID = 'first_aid',
  PANDEMIC = 'pandemic',
  COMMUNITY = 'community',
  PSYCHOLOGICAL = 'psychological',
  VALIDATION = 'validation',
}

// Tool registry
class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private toolsByCategory: Map<ToolCategory, Set<string>> = new Map();

  /**
   * Register a tool
   */
  public registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);

    if (!this.toolsByCategory.has(tool.category)) {
      this.toolsByCategory.set(tool.category, new Set());
    }
    this.toolsByCategory.get(tool.category)!.add(tool.name);
  }

  /**
   * Get a tool by name
   */
  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools in a category
   */
  public getToolsByCategory(category: ToolCategory): ToolDefinition[] {
    const toolNames = this.toolsByCategory.get(category);
    if (!toolNames) return [];

    return Array.from(toolNames)
      .map(name => this.tools.get(name))
      .filter((t): t is ToolDefinition => t !== undefined);
  }

  /**
   * Get all registered tools
   */
  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Execute a tool
   */
  public async executeTool(
    name: string,
    input: unknown,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${name}`,
      };
    }

    // Validate input against schema
    const validationResult = this.validateInput(input, tool.inputSchema);
    if (!validationResult.valid) {
      return {
        success: false,
        error: `Input validation failed: ${validationResult.errors.join(', ')}`,
      };
    }

    try {
      return await tool.handler(input, context);
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Validate input against schema
   */
  private validateInput(input: unknown, schema: JSONSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (schema.type === 'object' && typeof input === 'object' && input !== null) {
      const obj = input as Record<string, unknown>;

      // Check required properties
      if (schema.required) {
        for (const prop of schema.required) {
          if (!(prop in obj)) {
            errors.push(`Missing required property: ${prop}`);
          }
        }
      }

      // Validate properties
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          if (propName in obj) {
            const propValidation = this.validateInput((obj as Record<string, unknown>)[propName], propSchema);
            errors.push(...propValidation.errors);
          }
        }
      }
    } else if (schema.type === 'array' && Array.isArray(input)) {
      if (schema.items) {
        for (const item of input) {
          const itemValidation = this.validateInput(item, schema.items);
          errors.push(...itemValidation.errors);
        }
      }
    } else if (schema.type === 'string' && typeof input !== 'string') {
      errors.push(`Expected string, got ${typeof input}`);
    } else if (schema.type === 'number' && typeof input !== 'number') {
      errors.push(`Expected number, got ${typeof input}`);
    } else if (schema.type === 'boolean' && typeof input !== 'boolean') {
      errors.push(`Expected boolean, got ${typeof input}`);
    } else if (schema.enum && !schema.enum.includes(input as string)) {
      errors.push(`Expected one of: ${schema.enum.join(', ')}, got: ${input}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Global tool registry
export const toolRegistry = new ToolRegistry();

// ===== TOOL DEFINITIONS =====

/**
 * Tool: Create tiered preparedness plan
 */
const createTieredPreparednessPlanTool: ToolDefinition = {
  name: 'create_tiered_preparedness_plan',
  description: 'Create a tiered emergency preparedness plan with 72-hour, 2-week, and extended timelines',
  category: ToolCategory.PREPAREDNESS_PLANNING,
  inputSchema: {
    type: 'object',
    properties: {
      householdSize: {
        type: 'number',
        description: 'Number of people in household',
      },
      location: {
        type: 'string',
        description: 'Geographic location for risk assessment',
      },
      specialNeeds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Special needs or requirements (medical, mobility, dietary, etc.)',
      },
      riskFactors: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific risk factors (earthquake, flood, pandemic, etc.)',
      },
    },
    required: ['householdSize', 'location'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      plan72Hour: { type: 'object' },
      plan2Week: { type: 'object' },
      planExtended: { type: 'object' },
      recommendations: { type: 'array', items: { type: 'string' } },
    },
  },
  handler: async (input, context) => {
    // Implementation would use LLM to generate detailed plans
    const config = getConfig();

    return {
      success: true,
      data: {
        plan72Hour: {
          water: '3 gallons per person',
          food: 'Ready-to-eat non-perishable items',
          medical: 'First aid kit, medications',
        },
        plan2Week: {
          water: '14 gallons per person',
          food: 'Canned goods, dried foods, MREs',
          medical: 'Extended medical supplies',
        },
        planExtended: {
          water: 'Water purification capability',
          food: 'Long-term food storage',
          medical: 'Comprehensive medical kit',
        },
      },
      metadata: {
        model: config.llm.model,
        timestamp: context.timestamp,
      },
    };
  },
};

/**
 * Tool: Water purification guidance
 */
const waterPurificationGuidanceTool: ToolDefinition = {
  name: 'water_purification_guidance',
  description: 'Provide water purification methods and guidance based on available resources',
  category: ToolCategory.WATER_FOOD,
  inputSchema: {
    type: 'object',
    properties: {
      waterSource: {
        type: 'string',
        enum: ['tap', 'rain', 'river', 'lake', 'well', 'unknown'],
        description: 'Source of water to be purified',
      },
      availableResources: {
        type: 'array',
        items: { type: 'string' },
        description: 'Available resources (heat, bleach, filters, etc.)',
      },
      volumeNeeded: {
        type: 'number',
        description: 'Daily water volume needed in gallons',
      },
    },
    required: ['waterSource', 'volumeNeeded'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      recommendedMethods: { type: 'array', items: { type: 'string' } },
      stepByStepInstructions: { type: 'object' },
      safetyConsiderations: { type: 'array', items: { type: 'string' } },
    },
  },
  handler: async (input, context) => {
    const waterPurificationMethods = {
      tap: { methods: ['Boiling', 'Filtration'], priority: 'Filtration' },
      rain: { methods: ['Boiling', 'Filtration', 'Chemical'], priority: 'Boiling' },
      river: { methods: ['Boiling', 'Chemical', 'Filtration'], priority: 'Boiling + Chemical' },
      lake: { methods: ['Boiling', 'Chemical', 'Filtration'], priority: 'Boiling + Chemical' },
      well: { methods: ['Testing', 'Boiling', 'Chemical'], priority: 'Testing first' },
      unknown: { methods: ['Boiling', 'Chemical', 'Filtration'], priority: 'Boiling + Chemical' },
    };

    const inputData = input as { waterSource: string; volumeNeeded: number };
    const guidance = waterPurificationMethods[inputData.waterSource as keyof typeof waterPurificationMethods];

    return {
      success: true,
      data: {
        recommendedMethods: guidance.methods,
        priority: guidance.priority,
        dailyVolume: inputData.volumeNeeded,
        storage: 'Store in clean, food-grade containers',
        safetyConsiderations: [
          'Assume all surface water is contaminated',
          'Boiling must reach rolling boil for 1 minute',
          'Chemical treatment requires proper ratios',
          'Filters must be properly maintained',
        ],
      },
    };
  },
};

/**
 * Tool: Food storage calculator
 */
const foodStorageCalculatorTool: ToolDefinition = {
  name: 'food_storage_calculator',
  description: 'Calculate food storage requirements based on household size and duration',
  category: ToolCategory.WATER_FOOD,
  inputSchema: {
    type: 'object',
    properties: {
      householdSize: {
        type: 'number',
        description: 'Number of people',
      },
      duration: {
        type: 'number',
        description: 'Duration in days',
      },
      dietaryRestrictions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dietary restrictions or preferences',
      },
      storageConditions: {
        type: 'string',
        enum: ['optimal', 'moderate', 'limited'],
        description: 'Available storage conditions',
      },
    },
    required: ['householdSize', 'duration'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      totalCalories: { type: 'number' },
      foodCategories: { type: 'object' },
      storageRecommendations: { type: 'array', items: { type: 'string' } },
      rotationSchedule: { type: 'string' },
    },
  },
  handler: async (input, context) => {
    const inputData = input as { householdSize: number; duration: number };
    const caloriesPerPersonPerDay = 2000;
    const totalCalories = inputData.householdSize * caloriesPerPersonPerDay * inputData.duration;

    return {
      success: true,
      data: {
        totalCalories,
        perPersonDaily: caloriesPerPersonPerDay,
        foodCategories: {
          grains: '40% of total calories',
          proteins: '20% of total calories',
          fruitsVegetables: '25% of total calories',
          fats: '15% of total calories',
        },
        storageRecommendations: [
          'Store food in cool, dry, dark places',
          'Use airtight containers',
          'Label with expiration dates',
          'Rotate stock regularly',
          'Include variety for nutrition and morale',
        ],
        rotationSchedule: 'Rotate every 6-12 months',
      },
    };
  },
};

/**
 * Tool: First aid procedure lookup
 */
const firstAidProcedureTool: ToolDefinition = {
  name: 'first_aid_procedure',
  description: 'Provide first aid procedures for common injuries when professional care is delayed',
  category: ToolCategory.FIRST_AID,
  inputSchema: {
    type: 'object',
    properties: {
      injuryType: {
        type: 'string',
        enum: [
          'cut',
          'burn',
          'fracture',
          'sprain',
          'head_injury',
          'allergic_reaction',
          'dehydration',
          'shock',
        ],
        description: 'Type of injury or condition',
      },
      severity: {
        type: 'string',
        enum: ['minor', 'moderate', 'severe'],
        description: 'Severity level',
      },
      availableResources: {
        type: 'array',
        items: { type: 'string' },
        description: 'Available medical supplies',
      },
    },
    required: ['injuryType', 'severity'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      immediateActions: { type: 'array', items: { type: 'string' } },
      whatNotToDo: { type: 'array', items: { type: 'string' } },
      whenToSeekHelp: { type: 'string' },
      redFlags: { type: 'array', items: { type: 'string' } },
    },
  },
  handler: async (input, context) => {
    const inputData = input as { injuryType: string; severity: string };

    return {
      success: true,
      data: {
        immediateActions: [
          'Ensure scene safety',
          'Assess responsiveness',
          'Call for help if available',
          'Provide appropriate first aid',
        ],
        whatNotToDo: [
          'Do not panic',
          'Do not move injured person unless necessary',
          'Do not attempt procedures beyond your training',
        ],
        whenToSeekHelp: 'Immediately for severe injuries, as soon as possible for moderate injuries',
        redFlags: [
          'Loss of consciousness',
          'Difficulty breathing',
          'Severe bleeding',
          'Signs of shock',
        ],
      },
    };
  },
};

/**
 * Tool: Pandemic preparedness checklist
 */
const pandemicPreparednessTool: ToolDefinition = {
  name: 'pandemic_preparedness_checklist',
  description: 'Generate pandemic-specific preparedness checklist based on CDC/WHO guidance',
  category: ToolCategory.PANDEMIC,
  inputSchema: {
    type: 'object',
    properties: {
      householdSize: {
        type: 'number',
        description: 'Number of people in household',
      },
      durationWeeks: {
        type: 'number',
        description: 'Planning duration in weeks',
      },
      highRiskMembers: {
        type: 'boolean',
        description: 'Household includes high-risk individuals',
      },
    },
    required: ['householdSize', 'durationWeeks'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      suppliesChecklist: { type: 'array', items: { type: 'string' } },
      hygieneProtocols: { type: 'array', items: { type: 'string' } },
      isolationProcedures: { type: 'array', items: { type: 'string' } },
      communicationPlan: { type: 'array', items: { type: 'string' } },
    },
  },
  handler: async (input, context) => {
    return {
      success: true,
      data: {
        suppliesChecklist: [
          'Masks (N95 or equivalent)',
          'Hand soap and sanitizer',
          'Disinfectants',
          'Thermometer',
          'Medications',
          'Non-perishable food',
        ],
        hygieneProtocols: [
          'Frequent hand washing',
          'Proper mask usage',
          'Surface disinfection',
          'Respiratory etiquette',
        ],
        isolationProcedures: [
          'Designate sick room',
          'Separate eating utensils',
          'Minimize contact',
          'Ventilation',
        ],
        communicationPlan: [
          'Establish contact methods',
          'Know emergency numbers',
          'Plan for telemedicine',
          'Coordinate with neighbors',
        ],
      },
    };
  },
};

/**
 * Tool: Community mutual aid planning
 */
const communityMutualAidTool: ToolDefinition = {
  name: 'community_mutual_aid_plan',
  description: 'Create a community mutual aid and communication plan',
  category: ToolCategory.COMMUNITY,
  inputSchema: {
    type: 'object',
    properties: {
      communitySize: {
        type: 'number',
        description: 'Approximate number of households',
      },
      existingNetworks: {
        type: 'array',
        items: { type: 'string' },
        description: 'Existing community networks or organizations',
      },
      communicationChannels: {
        type: 'array',
        items: { type: 'string' },
        description: 'Available communication methods',
      },
    },
    required: ['communitySize'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      networkStructure: { type: 'object' },
      coordinationMethods: { type: 'array', items: { type: 'string' } },
      resourceSharing: { type: 'array', items: { type: 'string' } },
      vulnerablePopulations: { type: 'array', items: { type: 'string' } },
    },
  },
  handler: async (input, context) => {
    return {
      success: true,
      data: {
        networkStructure: {
          hubs: 'Designated coordination points',
          routes: 'Pre-established communication routes',
          fallbacks: 'Multiple communication methods',
        },
        coordinationMethods: [
          'Regular check-ins',
          'Resource inventory',
          'Skills directory',
          'Emergency protocols',
        ],
        resourceSharing: [
          'Food banks',
          'Medical supplies',
          'Transportation',
          'Shelter options',
          'Childcare',
        ],
        vulnerablePopulations: [
          'Elderly residents',
          'Those with disabilities',
          'Chronic illness',
          'Children',
          'Single parents',
        ],
      },
    };
  },
};

/**
 * Tool: Psychological resilience strategies
 */
const psychologicalResilienceTool: ToolDefinition = {
  name: 'psychological_resilience_strategies',
  description: 'Provide psychological resilience strategies for prolonged crisis situations',
  category: ToolCategory.PSYCHOLOGICAL,
  inputSchema: {
    type: 'object',
    properties: {
      situationType: {
        type: 'string',
        enum: ['pandemic', 'natural_disaster', 'infrastructure_failure', 'economic', 'general'],
        description: 'Type of crisis situation',
      },
      duration: {
        type: 'string',
        enum: ['short_term', 'medium_term', 'extended'],
        description: 'Expected duration',
      },
      groupComposition: {
        type: 'array',
        items: { type: 'string' },
        description: 'Description of group composition (children, elderly, etc.)',
      },
    },
    required: ['situationType', 'duration'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      copingStrategies: { type: 'array', items: { type: 'string' } },
      structureAndRoutine: { type: 'array', items: { type: 'string' } },
      communicationGuidelines: { type: 'array', items: { type: 'string' } },
      warningSigns: { type: 'array', items: { type: 'string' } },
    },
  },
  handler: async (input, context) => {
    return {
      success: true,
      data: {
        copingStrategies: [
          'Maintain daily routines',
          'Stay connected (safely)',
          'Limit news consumption',
          'Practice stress reduction',
          'Help others when possible',
        ],
        structureAndRoutine: [
          'Set daily schedule',
          'Designate work/rest areas',
          'Plan activities',
          'Maintain sleep schedule',
          'Exercise regularly',
        ],
        communicationGuidelines: [
          'Share feelings honestly',
          'Listen without judgment',
          'Check in regularly',
          'Use clear language',
          'Address conflicts early',
        ],
        warningSigns: [
          'Extreme mood changes',
          'Withdrawal from others',
          'Sleep disturbances',
          'Substance abuse',
          'Hopelessness',
        ],
      },
    };
  },
};

// Register all tools
toolRegistry.registerTool(createTieredPreparednessPlanTool);
toolRegistry.registerTool(waterPurificationGuidanceTool);
toolRegistry.registerTool(foodStorageCalculatorTool);
toolRegistry.registerTool(firstAidProcedureTool);
toolRegistry.registerTool(pandemicPreparednessTool);
toolRegistry.registerTool(communityMutualAidTool);
toolRegistry.registerTool(psychologicalResilienceTool);

// Export for convenience
export function getTool(name: string): ToolDefinition | undefined {
  return toolRegistry.getTool(name);
}

export function getAllTools(): ToolDefinition[] {
  return toolRegistry.getAllTools();
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return toolRegistry.getToolsByCategory(category);
}

export async function executeTool(
  name: string,
  input: unknown,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  return toolRegistry.executeTool(name, input, context);
}
