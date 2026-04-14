Phase 1 — File Creation
•	T001 Create src/pipeline/representationCorrector.ts
________________________________________
Phase 2 — Core Logic
•	T002 Implement correctRepresentation(elements: AIElement[]): AIElement[]
________________________________________
Phase 3 — Rule 1: Arc Limit
•	T003 Count arc elements
•	T004 If >2 → downgrade extras to "text"
________________________________________
Phase 4 — Rule 2: Layout Fix
•	T005 If layout === "arc" for all AND count >3
•	T006 Convert non-primary → "row"
________________________________________
Phase 5 — Rule 3: Group Redistribution
•	T007 Detect all elements in center
•	T008 Reassign:
o	time → center
o	date → top
o	data → right_panel
________________________________________
Phase 6 — Rule 4: Type Overrides
•	T009 Add mapping table
•	T010 Override arc → text+icon for data types
________________________________________
Phase 7 — Rule 5: Decorative Detection
•	T011 Detect weak arcs (no dataType / small sweep)
•	T012 Convert → "icon" or "standalone"
________________________________________
Phase 8 — Integration
•	T013 Import in pipeline/index.ts
•	T014 Insert before normalizer
________________________________________
Phase 9 — Logging (optional but recommended)
•	T015 Log corrections applied for debugging
________________________________________
Phase 10 — Validation
•	T016 Run pipeline with failing design
•	T017 Confirm:
o	Not all arcs
o	Mixed widget types
o	Layout resembles input
________________________________________
Phase 11 — Regression Tests
•	T018 Arc-only design remains arc
•	T019 Text-only design remains text
•	T020 Mixed design produces mixed widgets
________________________________________
Completion Criteria
•	No “all arc” outputs unless input truly arc-based
•	Visible structure matches input design
•	Pipeline remains deterministic

