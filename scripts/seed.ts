#!/usr/bin/env node

/**
 * Database Seeding Script
 * Seeds the system with initial preparedness data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__DIRNAME, '..');

interface SeedData {
  version: string;
  timestamp: string;
  preparednessLevels: PreparednessLevel[];
  waterPurificationMethods: WaterPurificationMethod[];
  foodCategories: FoodCategory[];
  pandemicSupplyCategories: PandemicSupplyCategory[];
  firstAidProcedures: FirstAidProcedure[];
}

interface PreparednessLevel {
  name: string;
  duration: string;
  water: string;
  food: string;
  medical: string;
  documents: string;
  tools: string;
  clothing: string;
  special: string;
}

interface WaterPurificationMethod {
  name: string;
  effectiveness: number;
  timeRequired: string;
  pros: string[];
  cons: string[];
  bestUse: string;
}

interface FoodCategory {
  name: string;
  percentage: number;
  examples: string[];
  storageGuidelines: string;
  shelfLife: string;
}

interface PandemicSupplyCategory {
  name: string;
  items: string[];
  quantityPerPerson: string;
  priority: number;
}

interface FirstAidProcedure {
  condition: string;
  immediateActions: string[];
  whatNotToDo: string[];
  whenToSeekHelp: string;
  redFlags: string[];
}

/**
 * Generate seed data
 */
function generateSeedData(): SeedData {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    preparednessLevels: [
      {
        name: '72-Hour Emergency Kit',
        duration: '3 days',
        water: '1 gallon per person per day',
        food: '3-day supply of non-perishable food',
        medical: 'First aid kit, 7-day prescription supply',
        documents: 'Copies of IDs, insurance, medical records',
        tools: 'Flashlight, radio, multi-tool, can opener',
        clothing: 'Change of clothes, sturdy shoes, weather gear',
        special: 'Consider special needs (infants, elderly, disabled)',
      },
      {
        name: '2-Week Emergency Supply',
        duration: '14 days',
        water: '14 gallons per person (stored)',
        food: '2-week supply, variety of food groups',
        medical: '30-day prescription supply, comprehensive kit',
        documents: 'Original documents in waterproof container',
        tools: 'Extended tools, backup power, communication',
        clothing: 'Multiple changes, seasonal gear',
        special: 'Backup power for medical equipment',
      },
      {
        name: 'Extended Emergency Supply',
        duration: '8+ weeks',
        water: 'Water purification capability',
        food: 'Long-term food storage, rotation system',
        medical: '90-day prescription supply, advanced medical supplies',
        documents: 'Multiple copies, off-site backup',
        tools: 'Comprehensive tool set, self-sufficiency equipment',
        clothing: 'Full wardrobe for all seasons',
        special: 'Complete self-sufficiency planning',
      },
    ],
    waterPurificationMethods: [
      {
        name: 'Boiling',
        effectiveness: 99.9,
        timeRequired: '1-3 minutes rolling boil + cooling',
        pros: ['Most reliable', 'Kills all pathogens', 'No chemicals needed'],
        cons: ['Requires fuel', 'Time-consuming', 'No practical cooling method'],
        bestUse: 'When fuel available and time permits',
      },
      {
        name: 'Chemical Treatment (Chlorine)',
        effectiveness: 99,
        timeRequired: '30 minutes wait time',
        pros: ['Lightweight', 'Effective against most pathogens', 'No equipment needed'],
        cons: ['Does not kill Cryptosporidium', 'Affects taste', 'Wait time required'],
        bestUse: 'Backup method, when boiling not practical',
      },
      {
        name: 'Filtration',
        effectiveness: 99.5,
        timeRequired: 'Immediate use',
        pros: ['Immediate use', 'No taste', 'Reusable'],
        cons: ['Can clog', 'Does not remove all viruses', 'Requires maintenance'],
        bestUse: 'Regular water treatment, when clean water available',
      },
      {
        name: 'UV Treatment',
        effectiveness: 99,
        timeRequired: 'Varies by method',
        pros: ['No chemicals', 'Effective against bacteria/viruses'],
        cons: ['Requires clear water', 'Battery dependent', 'No residual protection'],
        bestUse: 'Emergency use, when other methods unavailable',
      },
    ],
    foodCategories: [
      {
        name: 'Grains and Starches',
        percentage: 40,
        examples: ['Rice', 'Pasta', 'Crackers', 'Flour', 'Oats', 'Cereals'],
        storageGuidelines: 'Store in cool, dry, dark place. Use airtight containers.',
        shelfLife: '6-12 months for most, longer for properly stored grains',
      },
      {
        name: 'Proteins',
        percentage: 20,
        examples: ['Canned meats', 'Canned fish', 'Beans', 'Nuts', 'Seeds', 'Protein powder'],
        storageGuidelines: 'Keep dry, protect from pests. Rotate regularly.',
        shelfLife: '2-5 years for canned, 1-2 years for dried',
      },
      {
        name: 'Fruits and Vegetables',
        percentage: 25,
        examples: ['Canned fruits', 'Canned vegetables', 'Dried fruits', 'Fruit/vegetable juices'],
        storageGuidelines: 'Store in cool place, protect from light and heat.',
        shelfLife: '1-2 years for canned, 6-12 months for dried',
      },
      {
        name: 'Fats',
        percentage: 15,
        examples: ['Oil', 'Shelf-stable butter', 'Peanut butter', 'Nuts', 'Coconut oil'],
        storageGuidelines: 'Store away from heat and light. Check for rancidity.',
        shelfLife: '1-2 years for oils, 2+ years for sealed products',
      },
    ],
    pandemicSupplyCategories: [
      {
        name: 'Personal Protective Equipment',
        items: ['N95/KN95 masks', 'Surgical masks', 'Gloves', 'Hand sanitizer'],
        quantityPerPerson: '5 N95, 20 surgical, unlimited sanitizer',
        priority: 1,
      },
      {
        name: 'Hygiene Supplies',
        items: ['Disinfectant', 'Cleaning supplies', 'Soap', 'Trash bags'],
        quantityPerPerson: 'Sufficient for 8+ weeks',
        priority: 1,
      },
      {
        name: 'Medical Supplies',
        items: ['Thermometer', 'Pulse oximeter', 'Medications', 'First aid'],
        quantityPerPerson: '1 each, 30-day medication supply',
        priority: 2,
      },
      {
        name: 'Communication',
        items: ['Portable power bank', 'Radio', 'Charging cables'],
        quantityPerPerson: '1-2 power banks per household',
        priority: 2,
      },
      {
        name: 'Isolation Supplies',
        items: ['Separate eating utensils', 'Bedding', 'Waste disposal'],
        quantityPerPerson: 'Complete kit for 1 person',
        priority: 3,
      },
    ],
    firstAidProcedures: [
      {
        condition: 'Cuts and Scrapes',
        immediateActions: [
          'Ensure scene safety',
          'Wash hands before providing care',
          'Apply direct pressure to stop bleeding',
          'Clean wound with clean water',
          'Apply antibiotic ointment if available',
          'Cover with clean bandage',
        ],
        whatNotToDo: [
          'Do not blow on the wound',
          'Do not apply tourniquet unless severe bleeding',
          'Do not remove deeply embedded objects',
        ],
        whenToSeekHelp: 'If bleeding cannot be stopped, wound is deep, or shows signs of infection',
        redFlags: [
          'Heavy bleeding not stopping',
          'Wound deeper than 1/4 inch',
          'Visible bone or tendon',
          'Signs of infection (redness, heat, pus)',
        ],
      },
      {
        condition: 'Burns',
        immediateActions: [
          'Ensure scene safety',
          'Cool burn with cool (not cold) water',
          'Remove constricting items',
          'Cover with clean, non-stick bandage',
          'Elevate if possible',
        ],
        whatNotToDo: [
          'Do not use ice directly on burn',
          'Do not break blisters',
          'Do not apply butter or ointments',
          'Do not remove clothing stuck to burn',
        ],
        whenToSeekHelp: 'Burns covering large area, hands/feet/face/genitals, or electrical/chemical burns',
        redFlags: [
          'Burn larger than palm of hand',
          'Full thickness burn (white/charred)',
          'Difficulty breathing',
          'Electrical or chemical burn',
        ],
      },
      {
        condition: 'Fractures and Sprains',
        immediateActions: [
          'Ensure scene safety',
          'Immobilize injured area',
          'Apply cold packs to reduce swelling',
          'Elevate if possible',
          'Seek medical attention',
        ],
        whatNotToDo: [
          'Do not try to realign bone',
          'Do not massage injured area',
          'Do not apply heat in first 48 hours',
        ],
        whenToSeekHelp: 'Always for fractures, severe sprains, or if unable to bear weight',
        redFlags: [
          'Visible deformity',
          'Bone protruding through skin',
          'Loss of sensation',
          'Inability to move or bear weight',
        ],
      },
    ],
  };
}

/**
 * Main seeding function
 */
async function main(): Promise<void> {
  console.log('🌱 Seeding Survival Preparedness Strategist data...\n');

  // Generate seed data
  const seedData = generateSeedData();

  // Create data directory
  const dataDir = path.join(PROJECT_ROOT, '.cache', 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  // Write seed data
  const seedFile = path.join(dataDir, 'seed.json');
  fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2));

  console.log('✅ Seed data written to:', seedFile);
  console.log('\n📊 Seeded data summary:');
  console.log(`  - Preparedness levels: ${seedData.preparednessLevels.length}`);
  console.log(`  - Water purification methods: ${seedData.waterPurificationMethods.length}`);
  console.log(`  - Food categories: ${seedData.foodCategories.length}`);
  console.log(`  - Pandemic supply categories: ${seedData.pandemicSupplyCategories.length}`);
  console.log(`  - First aid procedures: ${seedData.firstAidProcedures.length}`);
  console.log('\n✨ Seeding complete!');
}

main().catch((error) => {
  console.error('Seeding error:', error);
  process.exit(1);
});
