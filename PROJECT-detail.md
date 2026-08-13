# PROJECT-detail.md — Global Crisis & Survival Preparedness Strategist

## 1. Problem Statement

A skill helping individuals and communities build practical preparedness for large-scale crises (pandemics, extended infrastructure disruption, natural catastrophes), grounded in public-health emergency-preparedness research and established survivalism/self-reliance methodology. Focuses on water, food, shelter, first aid, communication, and community-resilience planning. Explicitly excludes weapons-related content and defers to official public-health/emergency-management guidance as authoritative.

## 2. Target Users

Describe the primary user personas for this skill (fill in based on real usage once built): e.g., students, professionals, hobbyists, or practitioners in the relevant domain.

## 3. Functional Specification

### 3.1 Core Capabilities

- Design a tiered personal/family emergency-preparedness plan (72-hour, 2-week, extended)
- Explain water purification, food storage/rotation, and basic nutrition-preservation principles
- Explain pandemic-specific preparedness (based on CDC/WHO guidance): hygiene, isolation, supply planning
- Explain basic first-aid and field-medicine principles for when professional care is delayed
- Design a household/community communication and mutual-aid plan
- Explain psychological-resilience principles for prolonged-crisis coping
- Explicitly exclude weapons, explosives, or violence-related content; redirect to official guidance for anything beyond general preparedness

### 3.2 Key Methodologies & Frameworks Applied

- **FEMA/Ready.gov household emergency-preparedness framework**
- **WHO/CDC pandemic-preparedness planning guidance**
- **Wilderness/urban survival prioritization framework ('Rule of Threes': air, shelter, water, food)**
- **Community resilience and mutual-aid network theory**
- **Psychological First Aid (PFA) framework for crisis coping**

Each framework above should be operationalized as a concrete step, checklist, or template inside the skill's SKILL.md and reference files once this scaffold is turned into a runnable skill (see `DEVELOPMENT-TASK-BY-PHASES.md`).

### 3.3 Expected Input

Typical user requests this skill should handle (fill in with real example prompts during development and testing).

### 3.4 Expected Output Format

Define the structured output format(s) this skill should produce (e.g., structured report, checklist, scored recommendation, memo). Align with the methodologies above so outputs are consistent and auditable.

## 4. Out of Scope / Guardrails

- Always include the standing disclaimer for this domain (see CLAUDE.md).
- Never present output as a certified/professional determination (e.g., not a diagnosis, not a legal opinion, not a guaranteed forecast).
- Where the skill involves a named third party (e.g., a partner, a suspect, a specific person), do not produce a definitive judgment about that individual — stay at the level of general, population-based information and structured reasoning support.
- Flag explicitly when a licensed professional (doctor, lawyer, engineer, certified analyst, etc.) should be consulted.

## 5. Knowledge Base Dependency

This skill's reasoning quality depends on the research foundations catalogued in `SECOND-BRAIN-KNOWLEDGE-PAPER.md`. When building the actual skill (SKILL.md + references/), extract the operational principles from each paper into concrete reference files rather than leaving them as a flat reading list.

## 6. Success Criteria

- Output correctly applies the named methodologies rather than generic reasoning.
- Output is well-structured and consistent across repeated runs on similar inputs.
- Domain-appropriate guardrails/disclaimers are respected in every response.
- Test prompts (see `DEVELOPMENT-TASK-BY-PHASES.md`, Phase 5) produce outputs a subject-matter-competent reviewer would rate as sound.
