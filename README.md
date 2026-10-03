# DeadlineFit

DeadlineFit is a deterministic deadline feasibility checker built for the Devpost **Build With AI: Basics** hackathon.

It takes:

- a deadline;
- an ordered list of tasks;
- an estimated duration for each task;
- available hours per day.

It then calculates whether the work fits, allocates feasible work across the available calendar days, and reports the aggregate estimate tolerance:

```text
estimate tolerance = (available capacity / estimated work - 1) × 100
```

A positive value shows how much the estimates can grow in aggregate before the deadline stops fitting. A negative value means the estimated work already exceeds the available capacity.

## Run locally

Requirements:

- Node.js 20+

No API keys, database, external services, or package dependencies are required.

```bash
npm start
```

Open:

```text
http://localhost:4173
```

## Run tests

```bash
npm test
```

The test suite covers input validation, inclusive calendar-day counting, the UK daylight-saving boundary, estimate-tolerance calculations, feasibility states, and deterministic day-by-day allocation.

## Project structure

```text
.
├── index.html              # Single-screen application shell
├── styles.css              # Responsive UI styling
├── server.mjs              # Small local Node server
├── src/
│   ├── app.js              # Form interaction and result rendering
│   └── planner.js          # Deterministic planning logic
├── test/
│   └── planner.test.js     # Node test suite
└── devpost/
    ├── scope.md            # Approved project scope
    ├── prd.md              # Approved product requirements
    ├── spec.md             # Approved technical specification
    ├── checklist.md        # Build workflow record
    └── app-map.html        # Offline code/app map
```

## Technical notes

- Tasks are allocated sequentially in the order entered.
- A task may continue onto the next available day.
- Multiple tasks may share a day while remaining within the daily capacity.
- Impossible plans do not display a misleading successful allocation.
- Calendar-day calculations use date-only UTC arithmetic so daylight-saving changes do not alter the number of available calendar days.

## Licence

MIT — see `LICENSE`.
