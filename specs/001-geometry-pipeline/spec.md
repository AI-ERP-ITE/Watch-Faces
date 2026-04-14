Feature: Representation Correction Layer (Fix AI Arc Collapse)
Problem
The pipeline depends on AI-provided representation, layout, and group.
In circular designs, AI collapses everything to:
•	representation: "arc"
•	layout: "arc"
•	group: "center"
This causes:
•	All elements → ARC_PROGRESS
•	Geometry solver → concentric arc stacking
•	Output ≠ input design
This is not a geometry issue.
This is semantic collapse.
________________________________________
Goal
Introduce a deterministic correction layer that:
•	Validates AI output against layout plausibility
•	Overrides incorrect representations
•	Enforces representation diversity
•	Prevents arc monoculture
________________________________________
Non-Goals
•	No pixel-level geometry extraction
•	No changes to V2 generator
•	No changes to asset system
•	No AI model changes
________________________________________
Functional Requirements
FR-001 — Representation Sanity
•	Max 2 elements allowed with representation: "arc" unless explicitly justified
•	If exceeded → downgrade excess to "text" or "text+icon"
________________________________________
FR-002 — Layout Feasibility
If:
•	layout === "arc" AND element count > 3
Then:
•	Convert non-primary elements → layout: "row"
________________________________________
FR-003 — Group Distribution
If all elements are:
group === "center"
Then reassign:
Type	Group
time	center
date	top
data (steps, battery, heart, etc.)	right_panel
________________________________________
FR-004 — Type-Based Overrides
For known data types:
Type	Default Representation
steps	text+icon
battery	text+icon
heart_rate	text+icon
spo2	text
calories	text
Override applies when AI outputs "arc" without strong justification.
________________________________________
FR-005 — Decorative Arc Detection
If:
•	arc has no dataType OR
•	very thin OR
•	short sweep (<120°)
Then:
representation = "icon"
layout = "standalone"
________________________________________
FR-006 — Compound Expansion Compatibility
Corrected representations must still support:
•	text+icon
•	text+arc
________________________________________
FR-007 — Determinism
Given same AI output → correction must always produce same result.
________________________________________
Success Criteria
•	SC-001: Circular designs no longer collapse to all arcs
•	SC-002: Mixed UI (text + list + arcs) produced correctly
•	SC-003: At least 2 different widget types in output
•	SC-004: Output visually resembles input structure (not just elements)
________________________________________
Constraints
•	Must run in <5ms (simple rule-based)
•	No async operations
•	No dependency on external services
