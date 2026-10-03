---
doc: scope
status: approved
---

# DeadlineFit

A deterministic deadline feasibility checker that shows how much estimation error a plan can absorb before its deadline breaks.

## The Unique Kernel
DeadlineFit does not merely show spare hours. It expresses feasibility as **estimate tolerance**: the maximum aggregate estimation overrun the current plan can absorb before the deadline becomes impossible.

`estimate tolerance = (available capacity / estimated work - 1) × 100`

## Who It's For
A person planning a small project against one fixed deadline who already has rough task estimates but does not know how fragile those estimates are. Today they may compare total hours informally or use a task list without seeing how much estimation error remains tolerable.

## The Core Loop
The user enters a deadline, adds tasks with estimated durations, sets available hours per day, and builds the plan. DeadlineFit allocates the work across the available days and reports capacity, required work, and estimate tolerance. The user can then change an estimate or capacity and immediately see whether the plan remains feasible, becomes fragile, or becomes impossible.

## Inspiration & Identity
A single-screen planning tool that feels clear, analytical, and immediate. The interface should make the transition from feasible to fragile to impossible visually obvious without pretending that arbitrary universal safety thresholds are evidence-based.

## Why This Matters to the Learner
The project is deliberately small, deterministic, and filmable. It is intended to demonstrate disciplined plan-first AI-assisted development without adding an AI API or expanding into a general productivity product.

## What "Working" Looks Like
A complete end-to-end demo can enter a deadline, several tasks, task estimates, and available hours per day; build a deterministic day-by-day allocation; show capacity versus required work and estimate tolerance; then increase one task estimate until the same plan moves clearly from feasible toward zero tolerance and finally into an impossible state. Reducing scope or adding capacity returns the plan to feasible.

## The POC Boundary
One polished single-screen web app with:
- deadline input;
- tasks and estimated duration per task;
- available hours per day;
- a `Build plan` action;
- deterministic allocation across available days;
- available capacity versus required work;
- estimate-tolerance percentage;
- a clear impossible state.

Availability is expressed only as hours per day. There is no per-task slack metric.

## Later
A small `test +30% overrun` control may be considered only after the core MVP is complete, polished, and tested.

## Explicitly Cut
- Login/accounts — unnecessary for the proof of concept.
- Backend/database — no persistence is required to prove the kernel.
- Calendar integration or notifications — expand scope without improving the core proof.
- Collaboration — outside the single-user planning experiment.
- Complex dependencies or recurring tasks — would turn the project into a larger scheduling system.
- Drag-and-drop and analytics — polish/features without proving the core metric.
- Native mobile app — web is sufficient and faster to ship.
- AI/LLM API — the product logic is intentionally deterministic.
- Clock-time availability intervals — hours-per-day is the approved simpler model.
- Per-task slack — not logically justified with one final deadline and sequential tasks.
