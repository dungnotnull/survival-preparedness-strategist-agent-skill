#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates the configuration files against schemas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Load and parse JSON file
 */
function loadJsonFile(filePath: string): unknown {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load JSON file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Validate configuration schema
 */
function validateConfigSchema(config: unknown): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };

  if (typeof config !== 'object' || config === null) {
    result.valid = false;
    result.errors.push('Configuration must be an object');
    return result;
  }

  const configObj = config as Record<string, unknown>;

  // Check for required top-level sections
  const requiredSections = ['llm', 'agents', 'features', 'skillRegistry'];
  for (const section of requiredSections) {
    if (!(section in configObj)) {
      result.errors.push(`Missing required section: ${section}`);
    }
  }

  // Validate llm section
  if (configObj.llm && typeof configObj.llm === 'object') {
    const llm = configObj.llm as Record<string, unknown>;
    if (typeof llm.model !== 'string') {
      result.errors.push('llm.model must be a string');
    }
    if (typeof llm.temperature !== 'number') {
      result.errors.push('llm.temperature must be a number');
    } else if (llm.temperature < 0 || llm.temperature > 1) {
      result.errors.push('llm.temperature must be between 0 and 1');
    }
    if (typeof llm.maxTokens !== 'number') {
      result.errors.push('llm.maxTokens must be a number');
    }
  }

  // Validate agents section
  if (configObj.agents && typeof configObj.agents === 'object') {
    const agents = configObj.agents as Record<string, unknown>;
    if (typeof agents.maxConcurrentAgents !== 'number') {
      result.errors.push('agents.maxConcurrentAgents must be a number');
    } else if (agents.maxConcurrentAgents < 1 || agents.maxConcurrentAgents > 20) {
      result.errors.push('agents.maxConcurrentAgents must be between 1 and 20');
    }
  }

  // Validate features section
  if (configObj.features && typeof configObj.features === 'object') {
    const features = configObj.features as Record<string, unknown>;
    const featureFlags = [
      'enablePandemicModule',
      'enableFirstAidModule',
      'enableCommunityResilience',
      'enablePsychologicalSupport',
      'strictWeaponExclusion',
      'requireDisclaimer',
    ];

    for (const flag of featureFlags) {
      if (typeof features[flag] !== 'boolean') {
        result.errors.push(`features.${flag} must be a boolean`);
      }
    }
  }

  // Check for strict exclusion settings
  if (configObj.features && typeof configObj.features === 'object') {
    const features = configObj.features as Record<string, unknown>;
    if (features.strictWeaponExclusion !== true) {
      result.warnings.push('strictWeaponExclusion should be true for safety');
    }
    if (features.requireDisclaimer !== true) {
      result.warnings.push('requireDisclaimer should be true for compliance');
    }
  }

  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validate environment file
 */
function validateEnvFile(): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const envPath = path.join(PROJECT_ROOT, '.env');

  if (!fs.existsSync(envPath)) {
    result.warnings.push('.env file not found (using defaults)');
    return result;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  // Check for required variables
  const requiredVars = ['LLM_MODEL', 'LLM_TEMPERATURE', 'LLM_MAX_TOKENS'];
  const presentVars = new Set<string>();

  for (const line of envLines) {
    const [key] = line.split('=');
    presentVars.add(key.trim());

    // Validate specific variables
    if (key === 'LLM_TEMPERATURE') {
      const value = parseFloat(line.split('=')[1]);
      if (isNaN(value) || value < 0 || value > 1) {
        result.errors.push('LLM_TEMPERATURE must be a number between 0 and 1');
      }
    }
    if (key === 'LLM_MAX_TOKENS') {
      const value = parseInt(line.split('=')[1]);
      if (isNaN(value) || value < 1 || value > 200000) {
        result.errors.push('LLM_MAX_TOKENS must be a number between 1 and 200000');
      }
    }
  }

  for (const varName of requiredVars) {
    if (!presentVars.has(varName)) {
      result.warnings.push(`Environment variable ${varName} not set`);
    }
  }

  return result;
}

/**
 * Validate reference documents
 */
function validateReferenceDocuments(): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const referencesDir = path.join(PROJECT_ROOT, 'references');

  if (!fs.existsSync(referencesDir)) {
    result.errors.push('references directory not found');
    return result;
  }

  const requiredDocs = [
    'fema-readygov-framework.md',
    'who-cdc-pandemic-framework.md',
    'rule-of-threes-prioritization.md',
    'psychological-first-aid.md',
  ];

  for (const doc of requiredDocs) {
    const docPath = path.join(referencesDir, doc);
    if (!fs.existsSync(docPath)) {
      result.errors.push(`Required reference document missing: ${doc}`);
    } else {
      const stats = fs.statSync(docPath);
      if (stats.size === 0) {
        result.errors.push(`Reference document is empty: ${doc}`);
      } else if (stats.size < 1000) {
        result.warnings.push(`Reference document is very small: ${doc}`);
      }
    }
  }

  return result;
}

/**
 * Validate tool definitions
 */
function validateToolDefinitions(): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const toolsPath = path.join(PROJECT_ROOT, 'tools', 'tools.ts');

  if (!fs.existsSync(toolsPath)) {
    result.errors.push('tools.ts not found');
    return result;
  }

  const toolsContent = fs.readFileSync(toolsPath, 'utf-8');

  // Check for required tools
  const requiredTools = [
    'create_tiered_preparedness_plan',
    'water_purification_guidance',
    'food_storage_calculator',
    'first_aid_procedure',
    'pandemic_preparedness_checklist',
    'community_mutual_aid_plan',
    'psychological_resilience_strategies',
  ];

  for (const tool of requiredTools) {
    if (!toolsContent.includes(tool)) {
      result.errors.push(`Required tool missing: ${tool}`);
    }
  }

  // Check for tool schema definitions
  if (!toolsContent.includes('inputSchema') || !toolsContent.includes('outputSchema')) {
    result.errors.push('Tool definitions must include inputSchema and outputSchema');
  }

  return result;
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  console.log('🔍 Validating Survival Preparedness Strategist configuration...\n');

  const allResults: Record<string, ValidationResult> = {};

  // Validate configuration schema
  try {
    const schema = loadJsonFile(path.join(PROJECT_ROOT, 'config', 'schema.json'));
    console.log('✓ Configuration schema loaded');
    allResults.schema = validateConfigSchema(schema);
  } catch (error) {
    console.error('✗ Failed to load configuration schema');
    allResults.schema = { valid: false, errors: [(error as Error).message], warnings: [] };
  }

  // Validate environment file
  console.log('✓ Checking environment file...');
  allResults.env = validateEnvFile();

  // Validate reference documents
  console.log('✓ Checking reference documents...');
  allResults.references = validateReferenceDocuments();

  // Validate tool definitions
  console.log('✓ Checking tool definitions...');
  allResults.tools = validateToolDefinitions();

  // Display results
  console.log('\n' + '='.repeat(50));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(50) + '\n');

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const [name, result] of Object.entries(allResults)) {
    const status = result.valid ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name.toUpperCase()}`);

    if (result.errors.length > 0) {
      totalErrors += result.errors.length;
      console.log('  Errors:');
      for (const error of result.errors) {
        console.log(`    - ${error}`);
      }
    }

    if (result.warnings.length > 0) {
      totalWarnings += result.warnings.length;
      console.log('  Warnings:');
      for (const warning of result.warnings) {
        console.log(`    - ${warning}`);
      }
    }

    console.log('');
  }

  // Summary
  console.log('='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  console.log('');

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('✅ All validations passed!');
    process.exit(0);
  } else if (totalErrors === 0) {
    console.log('⚠️  Validations passed with warnings');
    process.exit(0);
  } else {
    console.log('❌ Validations failed. Please fix the errors above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Validation script error:', error);
  process.exit(1);
});
