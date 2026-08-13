# Survival Preparedness Strategist — Agent Architecture

## Overview

This document defines the flexible agent and skill architecture for the Survival Preparedness Strategist. The architecture uses a modular, hierarchical system of specialized agents that can be dynamically composed based on user needs.

## Architecture Principles

### 1. Hierarchical Composition
- Main agent coordinates sub-agents for domain-specific expertise
- Sub-agents can spawn additional specialist agents as needed
- Each agent has clear responsibilities and boundaries

### 2. Dynamic Resolution
- Skills and agents are resolved based on user request context
- Router determines optimal agent composition for each request
- Caching and optimization for repeated patterns

### 3. Isolation and Safety
- Each agent operates in isolated context
- Shared state through controlled interfaces
- Weapon exclusion enforced at all levels

### 4. Graceful Degradation
- System continues operating if individual agents fail
- Fallback behaviors for unavailable agents
- Progressive enhancement based on available resources

## Core Agent Types

### Main Coordination Agent

**Purpose:** Route user requests to appropriate sub-agents, coordinate multi-domain responses, ensure consistency and completeness.

**Responsibilities:**
- Parse and classify user requests
- Determine optimal sub-agent composition
- Aggregate sub-agent outputs
- Ensure guardrails are enforced
- Provide final response formatting

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "userRequest": {
      "type": "string",
      "description": "The user's preparedness request"
    },
    "context": {
      "type": "object",
      "description": "Conversation and environmental context"
    },
    "previousOutputs": {
      "type": "array",
      "description": "Previous related outputs for consistency"
    }
  },
  "required": ["userRequest"]
}
```

**Output Schema:**
```json
{
  "type": "object",
  "properties": {
    "response": {
      "type": "string",
      "description": "Formatted response to user"
    },
    "structuredOutput": {
      "type": "object",
      "description": "Structured data (plans, checklists, etc.)"
    },
    "disclaimer": {
      "type": "string",
      "description": "Required disclaimer text"
    },
    "confidence": {
      "type": "number",
      "description": "Confidence score (0-1)"
    },
    "requiresFollowUp": {
      "type": "boolean",
      "description": "Whether follow-up is recommended"
    }
  }
}
```

### Specialized Sub-Agents

#### 1. Tiered Preparedness Planning Agent

**Domain:** Emergency preparedness planning (72-hour, 2-week, extended)

**Expertise:**
- FEMA Ready.gov framework application
- Household-specific planning
- Risk assessment and prioritization
- Plan creation and customization

**Triggers:**
- "Create a preparedness plan"
- "Emergency planning"
- "Disaster readiness"
- "Get ready for emergency"
- Family/household safety planning

**Tools:**
- `create_tiered_preparedness_plan`
- Risk assessment calculators
- Template generators

#### 2. Water and Food Systems Agent

**Domain:** Water procurement, purification, and storage; food storage and nutrition

**Expertise:**
- Rule of Threes prioritization (water/food)
- Water purification methods
- Food storage calculations
- Nutritional planning for emergencies

**Triggers:**
- "Water purification", "store water"
- "Food storage", "emergency food"
- "Calculate supplies", "how much food"
- Water treatment questions

**Tools:**
- `water_purification_guidance`
- `food_storage_calculator`
- Inventory management

#### 3. Pandemic Preparedness Agent

**Domain:** Pandemic-specific preparedness based on CDC/WHO guidance

**Expertise:**
- Pandemic supply planning
- Hygiene protocols
- Isolation procedures
- Infection prevention

**Triggers:**
- "Pandemic", "epidemic", "outbreak"
- "Virus preparedness", "disease planning"
- "Isolation", "quarantine"
- "Pandemic supplies"

**Tools:**
- `pandemic_preparedness_checklist`
- CDC/WHO guideline lookup
- Infection control protocols

#### 4. First Aid and Field Medicine Agent

**Domain:** Basic first aid and field medicine when professional care is delayed

**Expertise:**
- Wilderness medicine principles
- Basic trauma care
- Common emergency procedures
- Medical resource planning

**Triggers:**
- "First aid", "medical emergency"
- "Injury", "wound", "medical help"
- "Field medicine", "wilderness medicine"
- "Medical kit"

**Tools:**
- `first_aid_procedure`
- Medical protocol lookup
- Symptom assessment

#### 5. Community Resilience and Mutual Aid Agent

**Domain:** Community-level planning, mutual aid networks, communication

**Expertise:**
- Community resilience theory
- Mutual aid network design
- Communication planning
- Vulnerable population support

**Triggers:**
- "Community", "neighbors", "mutual aid"
- "Communication plan", "check in"
- "Help others", "organize community"
- "Community resilience"

**Tools:**
- `community_mutual_aid_plan`
- Network mapping tools
- Communication templates

#### 6. Psychological Resilience Agent

**Domain:** Psychological coping strategies for prolonged crisis

**Expertise:**
- Psychological First Aid (PFA)
- Stress management techniques
- Resilience building
- Mental health resource identification

**Triggers:**
- "Coping", "stress", "anxiety"
- "Mental health", "psychological"
- "Resilience", "cope with crisis"
- "Psychological support"

**Tools:**
- `psychological_resilience_strategies`
- PFA protocol lookup
- Resource identification

## Agent Resolution and Routing

### Request Classification

**Router analyzes requests for:**

1. **Domain indicators** (keywords, context)
   - Water/food → WaterFoodAgent
   - Pandemic → PandemicAgent
   - First aid → FirstAidAgent
   - Community → CommunityAgent
   - Psychological → PsychologicalAgent
   - General planning → TieredPreparednessAgent

2. **Complexity assessment**
   - Single domain → Single sub-agent
   - Multi-domain → Multiple sub-agents
   - Complex coordination → Main agent + multiple sub-agents

3. **Urgency level**
   - High urgency → Direct routing to relevant agent
   - Planning/low urgency → Full routing optimization

### Agent Composition Patterns

**Pattern 1: Single Domain**
```
User Request → Main Agent → [Single Sub-Agent] → Response
```

**Pattern 2: Multi-Domain Sequential**
```
User Request → Main Agent → [Agent 1] → [Agent 2] → Aggregated Response
```

**Pattern 3: Multi-Domain Parallel**
```
User Request → Main Agent → [Agent 1] +
                           → [Agent 2] → Aggregated Response
```

**Pattern 4: Hierarchical**
```
User Request → Main Agent → [Sub-Agent] → [Specialist Agent] → Response
```

### Agent Communication Protocol

**Inter-agent message format:**
```json
{
  "from": "agent_id",
  "to": "agent_id",
  "messageType": "request|response|notification|error",
  "payload": {
    "data": {},
    "context": {},
    "metadata": {}
  },
  "timestamp": 1234567890,
  "correlationId": "unique_id"
}
```

**Message types:**
- `request`: Request for service or information
- `response`: Response to request
- `notification`: Informational update
- `error`: Error condition notification

## Skill Registry

### Skill Definition

Each skill is registered with:

```json
{
  "name": "skill_name",
  "version": "1.0.0",
  "description": "When and why this skill is used",
  "triggers": ["trigger phrases"],
  "agentType": "main|sub",
  "parentSkill": "parent_name (if sub-skill)",
  "inputSchema": {...},
  "outputSchema": {...},
  "tools": ["tool_names"],
  "dependencies": ["skill_names"],
  "executionTimeout": 300000,
  "maxDepth": 3
}
```

### Skill Resolution

**Resolution process:**

1. **Input classification**: Analyze user request for domain indicators
2. **Candidate identification**: Find potentially relevant skills
3. **Compatibility check**: Verify dependencies and requirements
4. **Priority ranking**: Rank by relevance, specificity, and success metrics
5. **Composition**: Combine skills if multiple domains detected
6. **Execution**: Execute composed skill pipeline
7. **Aggregation**: Combine outputs into cohesive response

### Skill Caching

**Cache structure:**
```json
{
  "cacheKey": "hashed_input_context",
  "skillComposition": ["skill1", "skill2"],
  "output": {...},
  "timestamp": 1234567890,
  "ttl": 3600000,
  "metadata": {
    "confidence": 0.95,
    "executionTime": 2345
  }
}
```

**Cache invalidation:**
- TTL expiration
- Skill version changes
- Configuration changes
- Manual invalidation

## Hook System Integration

### Hook Points in Agent Lifecycle

**Pre-Execution Hooks:**
- Weapon exclusion check
- Input validation
- Context size monitoring
- Resource availability check

**Execution Hooks:**
- Progress monitoring
- Token usage tracking
- Timeout management

**Post-Execution Hooks:**
- Output validation
- Disclaimer injection
- Quality checks
- Cache update

**Error Hooks:**
- Error classification
- Fallback execution
- Recovery procedures
- Logging and monitoring

## Tool System Integration

### Tool Invocation

**Agent → Tool flow:**

1. **Tool selection**: Agent determines needed tool
2. **Input preparation**: Prepare tool-specific input
3. **Execution**: Execute tool with timeout
4. **Result processing**: Process and validate tool output
5. **Integration**: Integrate tool result into agent response

### Tool Error Handling

**Error types:**
- `ValidationError`: Input validation failed
- `ExecutionError`: Tool execution failed
- `TimeoutError`: Tool exceeded timeout
- `NotFoundError`: Tool not found

**Error handling strategies:**
- Retry with modified input
- Fallback to alternative tool
- Graceful degradation
- User notification with guidance

## State Management

### Agent State

**State isolation:**
- Each agent has isolated state context
- State sharing through explicit interfaces
- No direct state access between agents

**State persistence:**
- Session-based state (conversation context)
- Persistent state (user preferences, historical data)
- Ephemeral state (temporary execution state)

### State Synchronization

**Synchronization mechanisms:**
- Event-based updates
- Polling for changes
- Direct state sharing (when appropriate)

**Synchronization triggers:**
- Agent completion
- State change notifications
- External state updates
- User interactions

## Performance Optimization

### Context Window Management

**Strategies:**
- Progressive disclosure (load detail as needed)
- Reference file lazy loading
- Input/output summarization
- Context pruning (remove less relevant content)

**Prioritization:**
- Critical information always retained
- User input/output retained
- Agent execution summaries retained
- Reference content loaded as needed

### Token Optimization

**Techniques:**
- Template compression
- Redundancy elimination
- Abbreviation for internal use
- Batch processing

### Execution Optimization

**Caching:**
- Skill composition caching
- Tool result caching
- Template result caching

**Parallelization:**
- Independent agent parallel execution
- Batch tool invocation
- Concurrent reference loading

## Monitoring and Observability

### Metrics

**Agent metrics:**
- Execution time
- Token usage
- Success/failure rates
- Error types and frequencies
- Cache hit rates

**Tool metrics:**
- Invocation frequency
- Execution time
- Success/failure rates
- Input/output sizes

### Logging

**Log levels:**
- `ERROR`: Errors and failures
- `WARN`: Warnings and deprecations
- `INFO`: Informational messages
- `DEBUG`: Detailed debugging information

**Log contents:**
- Agent/tool invocation
- Input/output summaries
- Error details
- Performance metrics
- User interactions

## Security and Safety

### Input Sanitization

**Sanitization steps:**
1. Remove potential injection attempts
2. Validate against input schemas
3. Check for prohibited content
4. Enforce size limits
5. Escape or remove dangerous characters

### Output Validation

**Validation steps:**
1. Validate against output schemas
2. Check for prohibited content
3. Verify completeness
4. Ensure disclaimer presence
5. Validate format and structure

### Rate Limiting

**Rate limits:**
- Agent execution rate
- Tool invocation rate
- API call rate
- Token usage rate

**Enforcement:**
- Per-user limits
- Per-session limits
- Global limits
- Dynamic adjustment based on load

## Configuration

### Environment Variables

**Required:**
- `LLM_MODEL`: Model to use for agent execution
- `MAX_TOKENS`: Maximum tokens per response
- `AGENT_TIMEOUT`: Agent execution timeout

**Optional:**
- `CACHE_ENABLED`: Enable/disable caching
- `DEBUG_MODE`: Enable debug logging
- `CUSTOM_TOOLS_PATH`: Path to custom tools
- `REFERENCE_PATHS`: Paths to reference documents

### Feature Flags

**Flags:**
- `ENABLE_PANDEMIC_MODULE`: Enable pandemic preparedness
- `ENABLE_FIRST_AID_MODULE`: Enable first aid guidance
- `ENABLE_COMMUNITY_RESILIENCE`: Enable community planning
- `ENABLE_PSYCHOLOGICAL_SUPPORT`: Enable psychological support
- `STRICT_WEAPON_EXCLUSION`: Strict weapons/violence exclusion
- `REQUIRE_DISCLAIMER`: Require disclaimers on all outputs

## Testing and Validation

### Agent Testing

**Test types:**
- Unit tests: Individual agent functionality
- Integration tests: Agent interaction
- End-to-end tests: Complete request flows
- Performance tests: Execution time and resource usage

### Validation

**Validation criteria:**
- Output completeness
- Schema conformance
- Guardrail compliance
- Quality standards
- User satisfaction

---

This architecture provides a flexible, scalable system for delivering survival preparedness guidance while maintaining safety, reliability, and performance. The modular design allows for easy extension and modification as requirements evolve.
