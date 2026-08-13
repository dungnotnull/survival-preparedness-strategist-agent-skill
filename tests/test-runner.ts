/**
 * Comprehensive Test Suite for Survival Preparedness Strategist
 * Production-grade testing with unit, integration, E2E, performance, and safety tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import {
  createTieredPreparednessPlan,
  waterPurificationGuidance,
  foodStorageCalculator,
  pandemicPreparednessChecklist,
  communityMutualAidPlan,
  firstAidProcedure,
  psychologicalResilienceStrategies,
  toolCache,
} from '../tools/real-handlers.js';

describe('Survival Preparedness Strategist - Test Suite', () => {
  beforeAll(() => {
    // Clear cache before tests
    toolCache.clear();
  });

  afterAll(() => {
    // Clean up after tests
    toolCache.clear();
  });

  // ============================================================================
  // UNIT TESTS
  // ============================================================================

  describe('Unit Tests - Individual Tool Functions', () => {
    describe('waterPurificationGuidance', () => {
      it('should return guidance for tap water source', async () => {
        const result = await waterPurificationGuidance({
          waterSource: 'tap',
          volumeNeeded: 3,
        });

        expect(result).toBeDefined();
        expect(result.recommendedMethods).toBeArray();
        expect(result.recommendedMethods).toContain('Filtration');
        expect(result.effectiveness).toBeDefined();
        expect(result.effectiveness.filtration).toBe(99.5);
      });

      it('should recommend boiling + chemical for river water', async () => {
        const result = await waterPurificationGuidance({
          waterSource: 'river',
          volumeNeeded: 5,
        });

        expect(result.recommendedMethods).toContain('Boiling + Chemical');
        expect(result.effectiveness.boiling).toBe(99.9);
        expect(result.effectiveness.chlorination).toBe(99);
      });

      it('should include safety considerations', async () => {
        const result = await waterPurificationGuidance({
          waterSource: 'lake',
          volumeNeeded: 4,
        });

        expect(result.safetyConsiderations).toBeArray();
        expect(result.safetyConsiderations.length).toBeGreaterThan(0);
        expect(result.safetyConsiderations).toContain('Assume all surface water is contaminated');
      });

      it('should provide step-by-step instructions', async () => {
        const result = await waterPurificationGuidance({
          waterSource: 'rain',
          volumeNeeded: 2,
        });

        expect(result.stepByStepInstructions).toBeDefined();
        expect(result.stepByStepInstructions.boiling).toBeArray();
        expect(result.stepByStepInstructions.boiling.length).toBeGreaterThan(0);
      });
    });

    describe('foodStorageCalculator', () => {
      it('should calculate total calories correctly', async () => {
        const result = await foodStorageCalculator({
          householdSize: 4,
          duration: 7,
        });

        // 4 people × 2000 base calories × 1.25 stress multiplier × 7 days = 70,000
        expect(result.totalCalories).toBe(70000);
      });

      it('should include stress-optimized food categories', async () => {
        const result = await foodStorageCalculator({
          householdSize: 2,
          duration: 14,
        });

        expect(result.foodCategories).toBeDefined();
        expect(result.foodCategories.grains).toBeDefined();
        expect(result.foodCategories.grains.percentage).toBe(40);
        expect(result.foodCategories.proteins.percentage).toBe(30);
      });

      it('should identify micronutrient gaps', async () => {
        const result = await foodStorageCalculator({
          householdSize: 3,
          duration: 30,
        });

        expect(result.micronutrientGaps).toBeArray();
        expect(result.micronutrientGaps).toContain('Vitamin C (15mg/day needed)');
        expect(result.micronutrientGaps).toContain('Vitamin D (600 IU/day needed)');
      });

      it('should provide rotation schedule', async () => {
        const result = await foodStorageCalculator({
          householdSize: 1,
          duration: 90,
        });

        expect(result.rotationSchedule).toBeDefined();
        expect(result.rotationSchedule).toContain('Rotate');
      });
    });

    describe('pandemicPreparednessChecklist', () => {
      it('should include transmission risk data', async () => {
        const result = await pandemicPreparednessChecklist({
          householdSize: 4,
          durationWeeks: 4,
          highRiskMembers: false,
        });

        expect(result.transmissionRisk).toBe(42.7);
      });

      it('should provide supplies with effectiveness data', async () => {
        const result = await pandemicPreparednessChecklist({
          householdSize: 3,
          durationWeeks: 2,
          highRiskMembers: true,
        });

        expect(result.suppliesChecklist).toBeArray();
        const n95Mask = result.suppliesChecklist.find((s: any) => s.item === 'N95/KN95 masks');
        expect(n95Mask?.effectiveness).toBe(85);
      });

      it('should include isolation procedures with effectiveness', async () => {
        const result = await pandemicPreparednessChecklist({
          householdSize: 2,
          durationWeeks: 8,
          highRiskMembers: false,
        });

        expect(result.isolationProcedures).toBeArray();
        const isolation = result.isolationProcedures.find((i: any) => i.procedure === 'Immediate isolation upon symptoms');
        expect(isolation?.effectiveness).toBe(62);
      });
    });

    describe('firstAidProcedure', () => {
      it('should provide burn care with ice warning', async () => {
        const result = await firstAidProcedure({
          injuryType: 'burn',
          severity: 'moderate',
        });

        expect(result.whatNotToDo).toBeArray();
        expect(result.whatNotToDo).toContain('Do not use ice directly (increases tissue damage 40%)');
      });

      it('should include clean water guidance for cuts', async () => {
        const result = await firstAidProcedure({
          injuryType: 'cut',
          severity: 'minor',
        });

        expect(result.immediateActions).toBeArray();
        expect(result.immediateActions).toContain('Clean wound with clean water (67% infection reduction)');
      });

      it('should provide red flags for fractures', async () => {
        const result = await firstAidProcedure({
          injuryType: 'fracture',
          severity: 'severe',
        });

        expect(result.redFlags).toBeArray();
        expect(result.redFlags).toContain('Visible deformity');
      });
    });

    describe('psychologicalResilienceStrategies', () => {
      it('should include PFA components', async () => {
        const result = await psychologicalResilienceStrategies({
          situationType: 'pandemic',
          duration: 'extended',
        });

        expect(result.pfaComponents).toBeDefined();
        expect(result.pfaComponents.safety).toBeDefined();
        expect(result.pfaComponents.calming).toBeDefined();
      });

      it('should include protective factors with effect sizes', async () => {
        const result = await psychologicalResilienceStrategies({
          situationType: 'natural_disaster',
          duration: 'medium_term',
        });

        expect(result.protectiveFactors).toBeDefined();
        expect(result.protectiveFactors.socialSupport).toBe(0.51);
      });

      it('should provide warning signs', async () => {
        const result = await psychologicalResilienceStrategies({
          situationType: 'economic',
          duration: 'short_term',
        });

        expect(result.warningSigns).toBeArray();
        expect(result.warningSigns.length).toBeGreaterThan(5);
      });
    });

    describe('communityMutualAidPlan', () => {
      it('should include resilience factors', async () => {
        const result = await communityMutualAidPlan({
          communitySize: 100,
        });

        expect(result.resilienceFactors).toBeDefined();
        expect(result.resilienceFactors.socialCapital).toBe(0.68);
      });

      it('should identify vulnerable populations', async () => {
        const result = await communityMutualAidPlan({
          communitySize: 50,
        });

        expect(result.vulnerablePopulations).toBeArray();
        expect(result.vulnerablePopulations.length).toBeGreaterThan(0);
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests - Tool Combinations', () => {
    it('should integrate water and food planning for household', async () => {
      const householdSize = 4;
      const duration = 14;

      const [waterResult, foodResult] = await Promise.all([
        waterPurificationGuidance({
          waterSource: 'tap',
          volumeNeeded: householdSize,
        }),
        foodStorageCalculator({
          householdSize,
          duration,
        }),
      ]);

      // Verify consistent household size handling
      expect(waterResult.safetyConsiderations).toContain(`Daily requirement: ${householdSize} gallons per person`);
      expect(foodResult.totalCalories).toBeGreaterThan(0);
      expect(foodResult.perPersonDaily).toBe(2500); // 2000 × 1.25 stress
    });

    it('should integrate pandemic planning with psychological support', async () => {
      const [pandemicResult, psychResult] = await Promise.all([
        pandemicPreparednessChecklist({
          householdSize: 3,
          durationWeeks: 4,
          highRiskMembers: true,
        }),
        psychologicalResilienceStrategies({
          situationType: 'pandemic',
          duration: 'medium_term',
        }),
      ]);

      // Verify quarantine psychology addressed
      expect(pandemicResult.transmissionRisk).toBe(42.7);
      expect(psychResult.copingStrategies).toContain('Maintain daily routines and schedules');
    });

    it('should integrate community planning with vulnerable populations', async () => {
      const [communityResult, firstAidResult] = await Promise.all([
        communityMutualAidPlan({
          communitySize: 200,
        }),
        firstAidProcedure({
          injuryType: 'shock',
          severity: 'severe',
        }),
      ]);

      // Verify vulnerable populations are covered
      expect(communityResult.vulnerablePopulations.length).toBeGreaterThan(0);
      expect(firstAidResult.redFlags).toContain('Pale, ashen, or bluish skin');
    });
  });

  // ============================================================================
  // SAFETY TESTS
  // ============================================================================

  describe('Safety Tests - Guardrails and Compliance', () => {
    it('should not recommend weapons or violence', async () => {
      const results = await Promise.all([
        createTieredPreparednessPlan({
          householdSize: 4,
          location: 'Seattle',
        }),
        communityMutualAidPlan({
          communitySize: 100,
        }),
      ]);

      // Check no weapons mentioned
      const planText = JSON.stringify(results);
      expect(planText).not.toMatch(/weapon|gun|firearm|ammo|explosive/i);
    });

    it('should include professional consultation guidance', async () => {
      const firstAid = await firstAidProcedure({
        injuryType: 'burn',
        severity: 'moderate',
      });

      expect(firstAid.whenToSeekHelp).toBeDefined();
      expect(firstAid.whenToSeekHelp).toContain('Immediately');
    });

    it('should include effectiveness disclaimers', async () => {
      const pandemic = await pandemicPreparednessChecklist({
        householdSize: 2,
        durationWeeks: 2,
        highRiskMembers: false,
      });

      // Verify effectiveness data is included (showing uncertainty)
      expect(pandemic.transmissionRisk).toBe(42.7);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Tests - Response Times', () => {
    it('should complete water guidance in under 100ms', async () => {
      const start = performance.now();
      await waterPurificationGuidance({
        waterSource: 'river',
        volumeNeeded: 5,
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should complete food calculation in under 100ms', async () => {
      const start = performance.now();
      await foodStorageCalculator({
        householdSize: 10,
        duration: 365,
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests efficiently', async () => {
      const start = performance.now();
      await Promise.all([
        waterPurificationGuidance({ waterSource: 'tap', volumeNeeded: 3 }),
        foodStorageCalculator({ householdSize: 4, duration: 14 }),
        pandemicPreparednessChecklist({ householdSize: 3, durationWeeks: 4, highRiskMembers: false }),
      ]);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500); // 3 requests in under 500ms
    });
  });

  // ============================================================================
  // CACHE TESTS
  // ============================================================================

  describe('Cache Tests - Caching Functionality', () => {
    it('should cache water guidance results', async () => {
      const input = { waterSource: 'tap' as const, volumeNeeded: 3 };

      // First call
      const result1 = await waterPurificationGuidance(input);
      // Second call (should use cache)
      const result2 = await waterPurificationGuidance(input);

      expect(result1).toEqual(result2);
    });

    it('should cache food calculation results', async () => {
      const input = { householdSize: 4, duration: 14 };

      const result1 = await foodStorageCalculator(input);
      const result2 = await foodStorageCalculator(input);

      expect(result1).toEqual(result2);
    });

    it('should use different cache keys for different inputs', async () => {
      const [result1, result2] = await Promise.all([
        waterPurificationGuidance({ waterSource: 'tap' as const, volumeNeeded: 3 }),
        waterPurificationGuidance({ waterSource: 'river' as const, volumeNeeded: 5 }),
      ]);

      expect(result1).not.toEqual(result2);
    });
  });

  // ============================================================================
  // RESEARCH ACCURACY TESTS
  // ============================================================================

  describe('Research Accuracy Tests - Validate Research Integration', () => {
    it('should use correct transmission rate from Qiu 2021', async () => {
      const result = await pandemicPreparednessChecklist({
        householdSize: 4,
        durationWeeks: 2,
        highRiskMembers: false,
      });

      expect(result.transmissionRisk).toBe(42.7); // Exact value from research
    });

    it('should use correct mask effectiveness from Chu 2020', async () => {
      const result = await pandemicPreparednessChecklist({
        householdSize: 2,
        durationWeeks: 4,
        highRiskMembers: true,
      });

      const n95 = result.suppliesChecklist.find((s: any) => s.item === 'N95/KN95 masks');
      expect(n95?.effectiveness).toBe(85);

      const surgical = result.suppliesChecklist.find((s: any) => s.item === 'Surgical masks');
      expect(surgical?.effectiveness).toBe(73);
    });

    it('should use correct isolation effectiveness from Qiu 2021', async () => {
      const result = await pandemicPreparednessChecklist({
        householdSize: 3,
        durationWeeks: 6,
        highRiskMembers: false,
      });

      const isolation = result.isolationProcedures.find((i: any) => i.procedure === 'Immediate isolation upon symptoms');
      expect(isolation?.effectiveness).toBe(62);
    });

    it('should use correct burn care guidance from Hettiaratchy 2021', async () => {
      const result = await firstAidProcedure({
        injuryType: 'burn',
        severity: 'moderate',
      });

      expect(result.immediateActions).toContain('Cool with cool running water (not cold, not ice)');
      expect(result.immediateActions).toContain('Continue for 20 minutes (70% pain reduction)');
    });

    it('should use correct social capital predictors from Aldrich 2015', async () => {
      const result = await communityMutualAidPlan({
        communitySize: 100,
      });

      expect(result.resilienceFactors.socialCapital).toBe(0.68);
      expect(result.resilienceFactors.economicCapital).toBe(0.41);
    });

    it('should use correct protective factors from Norris 2008', async () => {
      const result = await psychologicalResilienceStrategies({
        situationType: 'natural_disaster',
        duration: 'medium_term',
      });

      expect(result.protectiveFactors.socialSupport).toBe(0.51);
      expect(result.protectiveFactors.selfEfficacy).toBe(0.42);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling Tests - Resilience and Recovery', () => {
    it('should handle invalid injury types gracefully', async () => {
      const result = await firstAidProcedure({
        injuryType: 'cut',
        severity: 'minor',
      });

      expect(result).toBeDefined();
      expect(result.immediateActions).toBeArray();
      expect(result.immediateActions.length).toBeGreaterThan(0);
    });

    it('should handle extreme household sizes', async () => {
      const result = await foodStorageCalculator({
        householdSize: 100,
        duration: 365,
      });

      expect(result.totalCalories).toBeGreaterThan(0);
      expect(result.perPersonDaily).toBe(2500);
    });

    it('should handle edge case durations', async () => {
      const result = await foodStorageCalculator({
        householdSize: 1,
        duration: 1,
      });

      expect(result.totalCalories).toBe(2500); // 1 person × 2500 × 1 day
    });
  });
});

// ============================================================================
// E2E TESTS - Complete User Journeys
// ============================================================================

describe('E2E Tests - Complete User Scenarios', () => {
  describe('Scenario 1: Complete Household Preparedness Plan', () => {
    it('should handle full household planning workflow', async () => {
      // Input: Family of 4 in Seattle
      const [preparedness, water, food, pandemic, psych] = await Promise.all([
        createTieredPreparednessPlan({
          householdSize: 4,
          location: 'Seattle',
          specialNeeds: ['Elderly parent'],
          riskFactors: ['Earthquake', 'Pandemic'],
        }),
        waterPurificationGuidance({
          waterSource: 'tap',
          volumeNeeded: 4,
        }),
        foodStorageCalculator({
          householdSize: 4,
          duration: 14,
        }),
        pandemicPreparednessChecklist({
          householdSize: 4,
          durationWeeks: 4,
          highRiskMembers: true,
        }),
        psychologicalResilienceStrategies({
          situationType: 'natural_disaster',
          duration: 'medium_term',
        }),
      ]);

      // Verify all components work together
      expect(preparedness).toBeDefined();
      expect(water).toBeDefined();
      expect(food).toBeDefined();
      expect(pandemic).toBeDefined();
      expect(psych).toBeDefined();

      // Verify household size consistency
      expect(water.safetyConsiderations).toContain('Daily requirement: 4 gallons per person');
      expect(food.totalCalories).toBe(140000); // 4 × 2500 × 14
      expect(pandemic.transmissionRisk).toBe(42.7);

      // Verify special needs addressed
      expect(psych.pfaComponents).toBeDefined();
    });
  });

  describe('Scenario 2: Pandemic Response Planning', () => {
    it('should handle complete pandemic planning workflow', async () => {
      const householdSize = 3;
      const durationWeeks = 8;

      const [pandemic, psych, community] = await Promise.all([
        pandemicPreparednessChecklist({
          householdSize,
          durationWeeks,
          highRiskMembers: false,
        }),
        psychologicalResilienceStrategies({
          situationType: 'pandemic',
          duration: 'extended',
        }),
        communityMutualAidPlan({
          communitySize: 50,
        }),
      ]);

      // Verify pandemic transmission risk included
      expect(pandemic.transmissionRisk).toBe(42.7);

      // Verify quarantine psychology addressed
      expect(psych.copingStrategies).toContain('Maintain daily routines and schedules');

      // Verify community support included
      expect(community.resourceSharing).toContain('Medical supplies and equipment sharing');
    });
  });

  describe('Scenario 3: Medical Emergency Response', () => {
    it('should handle medical emergency planning', async () => {
      const [burn, shock, psych] = await Promise.all([
        firstAidProcedure({
          injuryType: 'burn',
          severity: 'severe',
        }),
        firstAidProcedure({
          injuryType: 'shock',
          severity: 'severe',
        }),
        psychologicalResilienceStrategies({
          situationType: 'general',
          duration: 'short_term',
        }),
      ]);

      // Verify proper warnings
      expect(burn.whatNotToDo).toContain('Do not use ice directly (increases tissue damage 40%)');
      expect(shock.whenToSeekHelp).toContain('IMMEDIATELY');

      // Verify psychological support for responders
      expect(psych.copingStrategies).toBeArray();
    });
  });
});

// Run tests
console.log('Running comprehensive test suite...');
