---
doc: prd
status: approved
---

# DeadlineFit — Product Requirements

A single-screen deadline feasibility checker for someone planning a small project against one fixed deadline.
Source: `scope.md > Who It's For`, `scope.md > The Unique Kernel`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. The user opens DeadlineFit and sees one compact planning form plus an empty results area.
2. The user selects a deadline.
3. The user adds one or more tasks, gives each task a name, and enters its estimated duration in hours.
4. The user enters the number of hours available per day.
5. The user presses **Build plan**.
6. DeadlineFit validates the inputs, calculates total required work and total available capacity, then allocates the tasks sequentially across the available calendar days.
7. The results show:
   - whether the plan fits;
   - available capacity versus estimated work;
   - estimate tolerance using `(available capacity / estimated work - 1) × 100`;
   - a deterministic day-by-day allocation.
8. The user increases a task estimate and builds again. The estimate-tolerance value visibly shrinks toward zero without relying on a universal "safe" threshold.
9. If required work exceeds capacity, DeadlineFit shows a clear **Impossible** state and preserves the negative formula result as evidence that the current plan is already over capacity.
10. The user can reduce task estimates/scope or increase hours per day, build again, and return the plan to a feasible state.

## Screens and Layout
Source: `scope.md > The POC Boundary`.

DeadlineFit has one responsive screen only.

On wider screens:
- the left side contains the planning inputs;
- the right side contains the current result summary and day-by-day plan.

On narrow screens the same sections stack vertically.

The input area contains:
- deadline;
- task rows with task name and estimated hours;
- add-task and remove-task controls;
- available hours per day;
- one primary **Build plan** button.

The result area contains:
- overall status;
- required work;
- available capacity;
- estimate tolerance;
- day-by-day task allocation.

No separate pages, navigation, account surfaces, or settings are introduced.

## Look and Feel
Source: `scope.md > Inspiration & Identity`.

The app should feel analytical, calm, and immediate rather than like a generic AI dashboard.

- Clean light interface with strong contrast and generous spacing.
- Clear sans-serif typography with a strong numeric hierarchy for capacity and tolerance.
- Restrained neutral/blue base styling.
- Green is reserved for a feasible result and red for an impossible result.
- The tolerance presentation should visually contract toward zero as estimates increase; this communicates growing fragility without inventing a universal percentage threshold.
- Avoid chat UI, AI imagery, gradients used only for decoration, excessive cards, or gamified language.

## Features and Behavior

### Planning Inputs
Source: `scope.md > The POC Boundary`.

- The deadline uses a date input.
- The deadline represents a whole calendar day.
- Available days are counted from the current local calendar date through the selected deadline, inclusive.
- A deadline before the current date is invalid.
- Availability is one positive number of hours per calendar day. Clock-time intervals are not supported.
- The task list starts with one row and supports adding and removing rows.
- Each task requires a non-empty name and a positive numeric estimate in hours.
- Decimal hour estimates are allowed.
- At least one valid task is required.
- Pressing **Build plan** is the only calculation trigger; editing an input does not silently replace the last completed result.

Acceptance criteria:
- [ ] A valid deadline, at least one valid task, and positive hours/day can be submitted.
- [ ] Invalid or missing values prevent calculation and produce concise inline guidance.
- [ ] Task rows can be added and removed without creating another screen.

### Capacity and Estimate Tolerance
Source: `scope.md > The Unique Kernel`.

- `estimated work` is the sum of all task estimates.
- `available capacity` is `number of available calendar days × available hours per day`.
- `estimate tolerance` is `(available capacity / estimated work - 1) × 100`.
- A non-negative result means the estimates currently fit within the deadline.
- A negative result means the current estimated work already exceeds capacity; the plan is **Impossible**.
- No universal "safe", "healthy", or "danger" percentage threshold is defined.
- The numeric value and visual scale communicate how close the plan is to zero tolerance.

Acceptance criteria:
- [ ] The displayed work total equals the sum of entered task hours.
- [ ] The displayed capacity equals available days multiplied by hours/day.
- [ ] The tolerance value matches the approved formula.
- [ ] Increasing required work while all other inputs remain constant reduces the tolerance deterministically.
- [ ] Work greater than capacity produces an Impossible result.

### Deterministic Allocation
Source: `scope.md > The Core Loop`.

- Tasks are scheduled in the order shown in the input list.
- Each day has the same capacity equal to the entered hours/day.
- Work fills the current day until its capacity is exhausted, then continues on the next available calendar day.
- A task may span more than one day.
- More than one task may appear on the same day if capacity remains.
- No dependency logic, priority optimisation, weekends/holidays logic, or clock-time placement is applied.

Acceptance criteria:
- [ ] The same valid inputs always produce the same allocation.
- [ ] No day's allocated hours exceed the entered daily capacity.
- [ ] The total allocated work equals the total estimated work when the plan is feasible.
- [ ] Task order is preserved.

### Result Presentation
Source: `scope.md > What "Working" Looks Like`.

For a feasible plan:
- show **Feasible** prominently;
- show required work, available capacity, and estimate tolerance;
- show the allocation for each used/available day in order;
- visually show how much tolerance remains relative to zero.

For an impossible plan:
- show **Impossible** prominently;
- show required work and available capacity;
- show the negative estimate-tolerance result from the same formula;
- explain briefly that the current estimates already exceed the available capacity;
- do not present a misleading successful allocation beyond the deadline.

Acceptance criteria:
- [ ] A reviewer can see the feasible → near-zero tolerance → impossible transition by changing only one task estimate.
- [ ] Reducing work or increasing daily capacity can return the plan to Feasible.
- [ ] The app never labels a specific positive percentage as universally safe or unsafe.

## States and Boundaries

- **First use** — planning inputs are ready; results prompt the user to build a plan.
- **Valid feasible result** — all summary metrics and the deterministic allocation are visible.
- **Valid near-zero result** — still Feasible while tolerance remains non-negative; the visual tolerance indication sits close to zero without assigning a universal risk label.
- **Impossible result** — required work exceeds available capacity and the result is clearly marked Impossible.
- **Input error** — invalid deadline, missing task name, non-positive task estimate, or non-positive hours/day prevents calculation and identifies the field that needs attention.
- **No persistence** — refreshing or reopening the page resets the current inputs and result.

## Product Decisions

- One responsive screen only — keeps the proof of concept fast to understand, build, and film.
- Whole calendar days from today through the deadline, inclusive — keeps the capacity model deterministic while respecting the approved hours-per-day input model.
- Sequential allocation in task-list order — avoids introducing an optimisation or dependency system that the core idea does not need.
- Explicit **Build plan** action — matches the approved workflow and makes each demo state deliberate.
- Tolerance remains a numeric continuum rather than an arbitrary risk classification — protects the meaning of the metric and avoids unsupported universal thresholds.
- Negative tolerance is shown in the Impossible state — preserves the approved formula instead of silently changing the metric at the boundary.
- No persistence — unnecessary to demonstrate the kernel.

## What We're Building

- One polished responsive web screen.
- Deadline input.
- Add/remove task rows with name and estimated hours.
- Hours available per day input.
- Input validation.
- Build plan action.
- Deterministic capacity calculation.
- Approved estimate-tolerance formula.
- Sequential day-by-day allocation.
- Feasible and Impossible result states.
- A visually obvious collapse of tolerance toward zero as estimates rise.
- Recovery to Feasible after reducing required work or increasing capacity.

## Deferred From the POC

- `Test +30% overrun` control — only worth considering after the required MVP is complete, polished, and tested.

## Possible Later Enhancements

A small scenario-testing control could apply a chosen overrun percentage to the current estimates and recalculate the same deterministic model. This is not part of the initial build.

## Non-Goals
Source: `scope.md > Explicitly Cut`.

- Accounts or login — no identity is required.
- Backend or database — no persistence is required.
- Calendar integration or notifications — outside the proof.
- Collaboration — single-user only.
- Complex task dependencies or recurring tasks — would materially expand scheduling logic.
- Drag-and-drop — unnecessary interaction complexity.
- Analytics — unrelated to proving feasibility.
- Native mobile app — responsive web is sufficient.
- AI/LLM API — product logic is deterministic by design.
- Clock-time availability intervals — only hours/day is supported.
- Per-task slack — not logically justified for this model.
- Evidence-free universal safety thresholds — the app reports the actual tolerance value instead.

## Open Questions

None blocking `4-spec`.
