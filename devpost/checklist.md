---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Build a plan and see feasibility plus estimate tolerance**
  Becomes usable: A running single-screen app where the user enters a deadline, tasks, and hours/day, presses **Build plan**, and immediately sees required work, available capacity, Feasible/Impossible status, and the approved estimate-tolerance percentage.
  Why now: This proves the unique kernel end to end first instead of spending time on generic scaffolding.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Planning Inputs`, `prd.md > Capacity and Estimate Tolerance`
  Spec ref: `spec.md > Planning Form`, `spec.md > Planner Engine`, `spec.md > Result Summary`, `spec.md > File Structure`
  Build: Create the no-dependency Node/browser project, implement the planning form, date-safe validation and calculations, result summary, and the tolerance visual.
  Verify (mechanical): Run `npm test`; start the local server; request `/` successfully; run planner tests covering inclusive day counts, the formula, feasible state, impossible state, and the UK DST boundary.
  Learner check: Open the app, build one clearly feasible plan, increase one task until tolerance approaches zero, and say whether the status and metric communicate the idea immediately.
  Commit: `Build DeadlineFit feasibility kernel`

- [x] **2. Show the deterministic day-by-day allocation**
  Becomes usable: Every feasible plan now shows exactly how task hours are distributed across calendar days in task-list order; impossible plans stop at the deadline instead of implying a successful schedule.
  Why now: This completes the required end-to-end plan while keeping the kernel already proven and testable.
  PRD ref: `prd.md > Deterministic Allocation`, `prd.md > Result Presentation`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Planner Engine`, `spec.md > Day-by-Day Allocation`, `spec.md > Important Failure Modes`
  Build: Add deterministic allocation to the planner engine, render the day-by-day plan, support task spanning and multiple tasks per day, and add boundary tests.
  Verify (mechanical): Run `npm test`; verify no day exceeds daily capacity, task order is preserved, total allocated hours equals required work for feasible plans, and impossible results return no allocation.
  Learner check: Build a plan where one task spans days and another shares the final day; confirm the allocation is understandable and matches the entered order.
  Commit: `Add deterministic daily allocation`

- [x] **3. Polish the demo path and awkward inputs**
  Becomes usable: DeadlineFit is visually polished, responsive, easy to film, and handles the few invalid-input cases that could derail the demo.
  Why now: Polish comes only after the complete deterministic function is verified, preventing feature creep before the core is solid.
  PRD ref: `prd.md > Look and Feel`, `prd.md > Result Presentation`, `prd.md > States and Boundaries`, `prd.md > What We're Building`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Input Error Feedback`, `spec.md > Important Failure Modes`
  Build: Finish responsive styling, concise inline validation, add/remove-row behavior, empty/result transitions, numeric formatting, and accessible status presentation. Do not add the optional +30% scenario control.
  Verify (mechanical): Run the full automated test suite; start the server without errors; run a scripted browser smoke check if a local headless browser is available; inspect the final staged diff for secrets/private context/unrelated files.
  Learner check: Run the 90-second demo path: feasible → near-zero → impossible → feasible again, then try one invalid input and note anything confusing or visually weak.
  Commit: `Polish DeadlineFit demo experience`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, before allocation/polish locks the presentation
- [x] Final kick-the-tires exploration and feedback completed — learner exercised the three-day demo path and confirmed the result was "perfect"; no changes requested

## Final Review

- [x] Final review complete — no revisions requested; learner confirmed the PoC is ready

## Code Tour and App Map

- [x] Learning activity complete — prior practice connected to the verified feasible → near-zero → impossible transition
- [x] Optional edit and transfer reflection addressed — not applicable; frozen scope preserved and no extra edit needed
- [x] `devpost/app-map.html` generated from finished code, checked offline, and prepared with a project-grounded practice to reuse

Activity and evidence: The learner manually exercised the final demo values: healthy tolerance, near-zero tolerance, exact capacity, impossible state, and day-by-day allocation. The reusable connection is between the measurable requirement, `src/planner.js > buildPlan()`, and `test/planner.test.js`.
Route and stops: Reference route recorded in `devpost/app-map.html`: `src/app.js` submit handler → `src/planner.js > buildPlan()` / `allocateTasks()` → `src/app.js > renderResult()` / `renderAllocation()`.
Edit outcome: Not applicable — no incidental edit was needed after final review.
Reflection: Already covered by the learner's confirmed preference for a fast, plan-first, verified workflow and final approval of the observed result.
Activity mode: Prior practice connected + brief evidence-based recap.

## Revisions
