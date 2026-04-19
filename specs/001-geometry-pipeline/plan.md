specs/002-representation-correction/plan.md
Summary
Add a new pipeline stage:
AI → validate → correctRepresentation → normalize → layout → geometry
________________________________________
Architecture Change
BEFORE
AI → Normalizer → Layout → Geometry
AFTER
AI → Validator → RepresentationCorrector → Normalizer → Layout → Geometry
________________________________________
New Module
src/pipeline/representationCorrector.ts
________________________________________
Responsibilities
•	Analyze AI output
•	Detect impossible layouts
•	Apply override rules
•	Return corrected AIElement[]
________________________________________
Data Flow
Input:
AIElement[]
Output:
AIElement[] (corrected)
No structural changes, only field overrides.
________________________________________
Core Algorithm
Step 1 — Count arcs
arcCount = elements.filter(e => e.representation === "arc").length
________________________________________
Step 2 — Apply rules in order
1.	Arc limit
2.	Layout feasibility
3.	Group distribution
4.	Type override
5.	Decorative filtering
________________________________________
Step 3 — Return corrected array
________________________________________
Integration Point
In pipeline/index.ts:
const validated = validateAIOutput(aiOutput)
const corrected = correctRepresentation(validated)
const normalized = normalize(corrected)
________________________________________
Risks
Risk	Mitigation
Over-correction	Only apply rules when thresholds exceeded
Losing valid arc designs	Allow 2 arcs always
Breaking existing arc watchfaces	Arc logic unchanged
________________________________________
Testing Strategy
•	Test arc-heavy design → remains arc
•	Test list-based design → becomes text rows
•	Test hybrid design → mixed output
________________________________________
