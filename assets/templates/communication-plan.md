# {{communityName}} Community Mutual Aid and Communication Plan

**Plan Date:** {{planDate}}
**Community Size:** {{communitySize}} households
**Coordinator:** {{coordinator}}
**Contact:** {{coordinatorContact}}

---

## DISCLAIMER

This plan provides general guidance for community-level emergency preparedness. It is not a substitute for professional emergency management or public health guidance. Always follow official instructions from emergency management and public health authorities.

---

## SECTION 1: COMMUNITY ASSESSMENT

### Demographics
- **Total households:** {{totalHouseholds}}
- **Total population:** {{totalPopulation}}
- **Vulnerable populations:** {{vulnerablePopulationCount}}
  - Elderly (65+): {{elderlyCount}}
  - Disabled: {{disabledCount}}
  - Children under 5: {{youngChildrenCount}}
  - Chronic health conditions: {{chronicConditionsCount}}

### Geographic Coverage
- **Area:** {{coverageArea}}
- **Terrain:** {{terrain}}
- **Access challenges:** {{accessChallenges}}

---

## SECTION 2: COMMUNICATION NETWORK

### Network Structure

**Hub Locations**
{% for hub in hubLocations %}
- **{{hub.name}}**
  - Address: {{hub.address}}
  - Coordinator: {{hub.coordinator}}
  - Contact: {{hub.contact}}
  - Resources: {{hub.resources}}
  - Coverage area: {{hub.coverageArea}}
{% endfor %}

**Communication Channels**
{% for channel in communicationChannels %}
- **{{channel.type}}**
  - Primary use: {{channel.primaryUse}}
  - Backup for: {{channel.backupFor}}
  - Contact: {{channel.contact}}
  - Reliability: {{channel.reliability}}
{% endfor %}

### Contact Hierarchy

1. **Primary:** {{primaryMethod}}
2. **Secondary:** {{secondaryMethod}}
3. **Emergency:** {{emergencyMethod}}
4. **Fallback:** {{fallbackMethod}}

---

## SECTION 3: SKILLS AND RESOURCES INVENTORY

### Skills Directory
{% for skill in skillsDirectory %}
- **{{skill.skill}}**
  - Qualified person: {{skill.person}}
  - Contact: {{skill.contact}}
  - Availability: {{skill.availability}}
  - Equipment: {{skill.equipment}}
{% endfor %}

### Resource Inventory

**Equipment**
{% for equipment in equipmentInventory %}
- **{{equipment.item}}**
  - Quantity: {{equipment.quantity}}
  - Location: {{equipment.location}}
  - Contact: {{equipment.contact}}
  - Availability: {{equipment.availability}}
{% endfor %}

**Supplies**
{% for supply in supplyInventory %}
- **{{supply.item}}**
  - Quantity: {{supply.quantity}}
  - Location: {{supply.location}}
  - Contact: {{supply.contact}}
{% endfor %}

---

## SECTION 4: VULNERABLE POPULATION SUPPORT

### Priority Households
{% for household in priorityHouseholds %}
- **{{household.address}}**
  - Residents: {{household.residents}}
  - Special needs: {{household.specialNeeds}}
  - Primary contact: {{household.primaryContact}}
  - Backup contact: {{household.backupContact}}
  - Assigned helper: {{household.assignedHelper}}
  - Check-in frequency: {{household.checkInFrequency}}
  - Special requirements: {{household.specialRequirements}}
{% endfor %}

### Special Assistance Teams
{% for team in assistanceTeams %}
- **{{team.name}}**
  - Team leader: {{team.leader}}
  - Members: {{team.members}}
  - Specialty: {{team.specialty}}
  - Assigned households: {{team.assignedHouseholds}}
  - Contact: {{team.contact}}
{% endfor %}

---

## SECTION 5: MUTUAL AID PROCEDURES

### Request for Assistance

**How to Request Help**
1. **Normal situations:**
   {% for step in normalRequest %}
   - {{step}}
   {% endfor %}

2. **Emergency situations:**
   {% for step in emergencyRequest %}
   - {{step}}
   {% endfor %}

### Response Protocol

**Response Levels**
- **Level 1 - Minor:** {{level1Response}}
- **Level 2 - Moderate:** {{level2Response}}
- **Level 3 - Major:** {{level3Response}}
- **Level 4 - Emergency:** {{level4Response}}

**Coordination Procedures**
{% for procedure in coordinationProcedures %}
1. {{procedure}}
{% endfor %}

---

## SECTION 6: RESOURCE SHARING SYSTEMS

### Food Banks
{% for bank in foodBanks %}
- **{{bank.name}}**
  - Location: {{bank.location}}
  - Hours: {{bank.hours}}
  - Contact: {{bank.contact}}
  - Access requirements: {{bank.accessRequirements}}
  - Capacity: {{bank.capacity}}
{% endfor %}

### Medical Support
{% for support in medicalSupport %}
- **{{support.name}}**
  - Type of support: {{support.type}}
  - Contact: {{support.contact}}
  - Availability: {{support.availability}}
  - Requirements: {{support.requirements}}
{% endfor %}

### Transportation
{% for transport in transportation %}
- **{{transport.provider}}**
  - Type: {{transport.type}}
  - Contact: {{transport.contact}}
  - Availability: {{transport.availability}}
  - Coverage area: {{transport.coverageArea}}
  - Special capabilities: {{transport.specialCapabilities}}
{% endfor %}

### Shelter Options
{% for shelter in shelters %}
- **{{shelter.name}}**
  - Type: {{shelter.type}}
  - Location: {{shelter.location}}
  - Capacity: {{shelter.capacity}}
  - Contact: {{shelter.contact}}
  - Opening criteria: {{shelter.openingCriteria}}
  - Special accommodations: {{shelter.specialAccommodations}}
{% endfor %}

---

## SECTION 7: CHECK-IN SYSTEM

### Regular Check-ins

**Daily Check-ins**
- Time: {{dailyCheckInTime}}
- Method: {{dailyCheckInMethod}}
- Responsibilities: {{dailyCheckInResponsibilities}}

**Weekly Check-ins**
- Time: {{weeklyCheckInTime}}
- Method: {{weeklyCheckInMethod}}
- Responsibilities: {{weeklyCheckInResponsibilities}}

**Emergency Check-ins**
- Trigger conditions: {{emergencyCheckInTriggers}}
- Method: {{emergencyCheckInMethod}}
- Response time: {{emergencyCheckInResponseTime}}

### Check-in Status
- **All clear:** ✅
- **Needs attention:** ⚠️
- **Emergency:** 🚨

---

## SECTION 8: INFORMATION DISSEMINATION

### Official Information Sources
{% for source in informationSources %}
- **{{source.type}}**
  - Source: {{source.source}}
  - Contact: {{source.contact}}
  - Update frequency: {{source.updateFrequency}}
{% endfor %}

### Community Notification System

**Notification Types**
- **Routine updates:** {{routineNotificationMethod}}
- **Urgent alerts:** {{urgentNotificationMethod}}
- **Emergency warnings:** {{emergencyNotificationMethod}}

**Verification Procedures**
{% for procedure in verificationProcedures %}
1. {{procedure}}
{% endfor %}

---

## SECTION 9: TRAINING AND DRILLS

### Training Schedule
{% for training in trainingSchedule %}
- **{{training.topic}}**
  - Date: {{training.date}}
  - Time: {{training.time}}
  - Location: {{training.location}}
  - Instructor: {{training.instructor}}
  - Required for: {{training.requiredFor}}
{% endfor %}

### Drill Schedule
{% for drill in drillSchedule %}
- **{{drill.type}}**
  - Date: {{drill.date}}
  - Objectives: {{drill.objectives}}
  - Participants: {{drill.participants}}
  - Evaluation criteria: {{drill.evaluationCriteria}}
{% endfor %}

---

## SECTION 10: PLAN MAINTENANCE

### Update Schedule
- **Skills directory:** {{skillsUpdateFrequency}}
- **Resource inventory:** {{resourcesUpdateFrequency}}
- **Priority households:** {{priorityHouseholdsUpdateFrequency}}
- **Contact information:** {{contactsUpdateFrequency}}
- **Full plan review:** {{fullPlanReviewFrequency}}

### Update Responsibilities
{% for responsibility in updateResponsibilities %}
- **{{responsibility.task}}**: {{responsibility.person}} ({{responsibility.frequency}})
{% endfor %}

### Next Review Date
{{nextReviewDate}}

---

**Plan approved by:** {{approver}}
**Approval date:** {{approvalDate}}
**Review date:** {{nextReviewDate}}

---

## APPENDIX: CONTACT LISTS

### Hub Coordinators
{% for coordinator in hubCoordinators %}
- {{coordinator.hub}}: {{coordinator.name}} - {{coordinator.contact}}
{% endfor %}

### Emergency Services
- Emergency: 911
- Police: {{policeContact}}
- Fire: {{fireContact}}
- Medical: {{medicalContact}}
- Public Health: {{publicHealthContact}}

### Utility Companies
{% for utility in utilities %}
- {{utility.type}}: {{utility.contact}}
{% endfor %}

---

**Remember:** This mutual aid plan is designed to support, not replace, official emergency services. Always follow instructions from emergency management and public health authorities.
