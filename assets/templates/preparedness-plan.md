# {{householdName}} Emergency Preparedness Plan

**Plan Date:** {{planDate}}
**Household Size:** {{householdSize}}
**Location:** {{location}}
**Plan Type:** {{planType}} (72-hour / 2-week / extended)

---

## IMPORTANT NOTICES

### Disclaimer
This plan provides general, educational/analytical information only. It is not a substitute for advice from a qualified professional (medical, legal, financial, meteorological, engineering, or otherwise, as applicable). Always verify with a qualified professional before making decisions based on this plan.

### Special Considerations
{% if specialNeeds %}
This household has the following special needs:
{% for need in specialNeeds %}
- {{need}}
{% endfor %}
{% endif %}

---

## SECTION 1: HOUSEHOLD INFORMATION

### Family Members
{% for member in householdMembers %}
**{{member.name}}**
- Age: {{member.age}}
- Relationship: {{member.relationship}}
- Special needs: {{member.specialNeeds}}
- Emergency contact: {{member.emergencyContact}}
{% endfor %}

### Important Contacts
- **Out-of-area contact:** {{outOfAreaContact}}
- **Emergency services:** 911
- **Local emergency management:** {{localEmergencyManagement}}
- **Healthcare providers:** {{healthcareProviders}}
- **Veterinarian (if pets):** {{veterinarian}}

---

## SECTION 2: RISK ASSESSMENT

### Identified Risks
{% for risk in identifiedRisks %}
- {{risk.name}} ({{risk.likelihood}} likelihood, {{risk.severity}} severity)
{% endfor %}

### Highest Priority Risks
{% for risk in priorityRisks %}
1. {{risk}}
{% endfor %}

---

## SECTION 3: COMMUNICATION PLAN

### Meeting Locations
**Primary Meeting Place**
- Location: {{primaryMeetingPlace}}
- Address: {{primaryMeetingAddress}}
- Notes: {{primaryMeetingNotes}}

**Secondary Meeting Place**
- Location: {{secondaryMeetingPlace}}
- Address: {{secondaryMeetingAddress}}
- Notes: {{secondaryMeetingNotes}}

### Communication Methods
{% for method in communicationMethods %}
- **{{method.type}}**: {{method.contact}} ({{method.priority}} priority)
{% endfor %}

### Check-in Procedures
{% for procedure in checkInProcedures %}
1. {{procedure}}
{% endfor %}

---

## SECTION 4: EMERGENCY SUPPLIES

### {{planType}} Supply Checklist

#### Water
- **Quantity needed:** {{waterQuantity}} gallons
- **Storage location:** {{waterStorage}}
- **Rotation schedule:** {{waterRotation}}
- **Purification method:** {{waterPurification}}

#### Food
- **Calories per person per day:** {{caloriesPerPerson}}
- **Total calories needed:** {{totalCalories}}
- **Storage location:** {{foodStorage}}
- **Rotation schedule:** {{foodRotation}}

**Food Categories:**
{% for category in foodCategories %}
- **{{category.name}}** ({{category.percentage}}%): {{category.examples}}
{% endfor %}

#### Medical Supplies
{% for item in medicalSupplies %}
- {{item.quantity}} {{item.item}}
{% endfor %}

#### Tools and Equipment
{% for item in tools %}
- {{item.quantity}} {{item.item}}
{% endfor %}

#### Important Documents
{% for doc in documents %}
- {{doc}}
{% endfor %}

#### Special Supplies
{% for item in specialSupplies %}
- {{item.item}}: {{item.quantity}} ({{item.notes}})
{% endfor %}

---

## SECTION 5: EVACUATION PLAN

### Evacuation Routes
**Primary Route**
- From home: {{primaryRouteHome}}
- From work/school: {{primaryRouteWork}}
- Destination: {{primaryDestination}}

**Secondary Route**
- From home: {{secondaryRouteHome}}
- From work/school: {{secondaryRouteWork}}
- Destination: {{secondaryDestination}}

### Evacuation Procedures
{% for procedure in evacuationProcedures %}
1. {{procedure}}
{% endfor %}

### Go-Bag Contents
{% for item in goBagItems %}
- {{item}}
{% endfor %}

---

## SECTION 6: SPECIAL CONSIDERATIONS

### Children
{% for consideration in childConsiderations %}
- {{consideration}}
{% endfor %}

### Elderly or Disabled Family Members
{% for consideration in elderlyConsiderations %}
- {{consideration}}
{% endfor %}

### Pets
{% for pet in pets %}
- **{{pet.name}}** ({{pet.type}})
  - Emergency contacts: {{pet.emergencyContact}}
  - Supplies needed: {{pet.supplies}}
  - Special considerations: {{pet.specialConsiderations}}
{% endfor %}

---

## SECTION 7: SKILLS AND TRAINING

### Household Skills
{% for skill in householdSkills %}
- **{{skill.skill}}**: {{skill.qualifiedPerson}}
{% endfor %}

### Training Needed
{% for training in trainingNeeded %}
- {{training.topic}} ({{training.urgency}})
{% endfor %}

---

## SECTION 8: PLAN MAINTENANCE

### Review Schedule
- **Monthly:** {{monthlyReviewTasks}}
- **Quarterly:** {{quarterlyReviewTasks}}
- **Annually:** {{annualReviewTasks}}

### Supply Rotation
{% for item in rotationSchedule %}
- **{{item.item}}**: Rotate every {{item.frequency}}
{% endfor %}

### Next Review Date
{{nextReviewDate}}

---

## SECTION 9: CONTACTS AND RESOURCES

### Local Resources
{% for resource in localResources %}
- **{{resource.name}}**: {{resource.contact}}
{% endfor %}

### Online Resources
{% for resource in onlineResources %}
- {{resource.name}}: {{resource.url}}
{% endfor %}

### Emergency Broadcast Information
- **NOAA Weather Radio:** {{weatherRadioFrequency}}
- **Local emergency stations:** {{emergencyStations}}
- **Alert systems:** {{alertSystems}}

---

**Plan created by:** {{planAuthor}}
**Last updated:** {{lastUpdated}}
**Next review date:** {{nextReviewDate}}

---

## REMINDERS

1. **Keep this plan accessible** - Store copies in multiple locations (home, work, vehicle, cloud)
2. **Practice the plan** - Regular drills ensure everyone knows what to do
3. **Update as needed** - Review and update when household circumstances change
4. **Share with trusted contacts** - Ensure family members and trusted contacts have copies
5. **Remember the Rule of Threes**: Air (minutes) > Shelter (hours) > Water (days) > Food (weeks)
