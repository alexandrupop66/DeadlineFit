---
doc: spec
status: approved
---

# DeadlineFit — Technical Spec

## How This Works, In Plain Language
DeadlineFit is a small browser app with no backend and no external API. The page collects a deadline, ordered task estimates, and available hours per day. When **Build plan** is pressed, pure JavaScript validates the inputs, counts calendar days safely, calculates capacity and estimate tolerance, and—only when the plan fits—allocates task hours sequentially across those days.

The calculation logic is kept separate from the screen code so it can be tested directly. The app deliberately uses no framework and no external runtime dependency: that keeps the proof of concept fast to build, easy to inspect, and unlikely to fail because of setup or network issues.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. The browser loads `index.html`; `src/app.js` renders the initial task row and empty result state.
2. The user enters a deadline, one or more task names/hours, and hours available per day.
3. Pressing **Build plan** sends those values to the pure functions in `src/planner.js`.
4. `planner.js` validates the values and converts the current local date plus deadline into date-only calendar values.
5. It counts available calendar days inclusively, avoiding elapsed-millisecond arithmetic so the UK daylight-saving change cannot create an off-by-one result.
6. It calculates required work, available capacity, and estimate tolerance using the approved formula.
7. If tolerance is negative, it returns an **Impossible** result and no beyond-deadline allocation.
8. If the plan fits, it allocates tasks in input order across equal-capacity days and returns the deterministic daily plan.
9. `src/app.js` renders the status, metrics, tolerance visual, allocation, and any validation errors.
10. Changing an estimate and pressing **Build plan** again repeats the same deterministic path, enabling the feasible → near-zero → impossible demo.

## Stack

### HTML5
One semantic single-page document.
Documentation: https://developer.mozilla.org/en-US/docs/Web/HTML

### CSS3
Plain responsive CSS; no framework, preprocessor, icon pack, or remote font dependency.
Documentation: https://developer.mozilla.org/en-US/docs/Web/CSS

### JavaScript ES Modules
Browser-side UI plus pure calculation functions. Native modules allow the planner logic to be reused by Node tests without a bundler.
Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

### Node.js built-ins
Used only for local serving and automated tests. No npm packages are required.
- HTTP server: https://nodejs.org/api/http.html
- Test runner: https://nodejs.org/api/test.html

Tradeoff accepted: this avoids framework convenience in exchange for a much smaller failure surface and faster delivery, which suits this one-screen proof of concept.

## Where It Runs and How Someone Tries It
The app runs in a modern desktop browser from a tiny local Node server.

Requirements:
- Node.js 20+.
- No API keys.
- No environment variables.
- No internet connection required after the source is present.

Start command:

```bash
npm start
```

Then open:

```text
http://localhost:4173
```

Automated logic checks:

```bash
npm test
```

The required demo can be recorded directly from this local browser session. Deployment is optional and is not part of the MVP.

## Look and Feel
Implements `prd.md > Look and Feel`.

- Responsive two-column layout on wider screens; stacked on narrow screens.
- Clean light surface, restrained blue/neutral palette, high contrast.
- Native/system sans-serif stack to avoid font downloads.
- Strong numeric hierarchy for capacity, work, and tolerance.
- Green used for **Feasible**, red for **Impossible**; ordinary inputs and neutral information remain blue/grey.
- Tolerance is displayed numerically and as a simple horizontal reserve bar that contracts toward zero as estimates rise. The bar is not labelled with invented safety categories.
- Copy remains concise, analytical, and non-gamified.

## Components

### Planning Form
Implements `prd.md > Planning Inputs`.

Owns the deadline input, task list, hours/day input, add/remove task controls, validation-message placement, and **Build plan** action. It reads values only when the user submits; editing inputs does not automatically overwrite the previous result.

### Planner Engine
Implements `prd.md > Capacity and Estimate Tolerance` and `prd.md > Deterministic Allocation`.

Pure functions in `src/planner.js`:
- parse and validate date-only values;
- count calendar days inclusively using UTC date arithmetic on date-only components;
- sum estimated task work;
- calculate capacity;
- calculate estimate tolerance;
- allocate tasks sequentially across daily capacity;
- return a structured feasible or impossible result.

The same valid inputs must always return the same result.

### Result Summary
Implements `prd.md > Result Presentation`.

Renders:
- **Feasible** or **Impossible** status;
- required work;
- available capacity;
- available days;
- estimate-tolerance percentage;
- reserve/tolerance visual that approaches zero without threshold labels.

### Day-by-Day Allocation
Implements `prd.md > Deterministic Allocation` and `prd.md > Result Presentation`.

For feasible results only, renders each calendar day in order with the task portions assigned to that day. A task may span days and multiple tasks may share one day, but daily allocated hours never exceed the configured hours/day.

### Input Error Feedback
Implements `prd.md > States and Boundaries`.

Invalid values prevent calculation and produce concise field-level guidance. The existing completed result may remain visible until a new valid plan is built; errors are clearly associated with the current attempted inputs.

## Data Model
No persistence is used; all data lives in browser memory and resets on refresh.

### Input data
```text
deadline: YYYY-MM-DD
hoursPerDay: positive number
tasks: [
  { id, name, hours }
]
```

### Planner result
```text
{
  status: "feasible" | "impossible",
  startDate: YYYY-MM-DD,
  deadline: YYYY-MM-DD,
  availableDays: number,
  requiredWork: number,
  availableCapacity: number,
  tolerancePercent: number,
  allocation: [
    {
      date: YYYY-MM-DD,
      totalHours: number,
      items: [{ taskName, hours }]
    }
  ]
}
```

For an impossible result, `allocation` is empty to avoid showing work beyond the deadline.

## File Structure

```text
DeadlineFit/
├── index.html                 # Single application screen
├── styles.css                 # Responsive visual styling
├── package.json               # Start/test scripts; no dependencies
├── server.mjs                 # Tiny Node static-file server
├── src/
│   ├── planner.js             # Pure validation, date, metric, allocation logic
│   └── app.js                 # DOM interactions and rendering
├── test/
│   └── planner.test.js        # Deterministic logic and boundary tests
├── devpost/
│   ├── learner-profile.md     # Ignored personal learning context
│   ├── scope.md               # Approved official scope artifact
│   ├── prd.md                 # Approved official product requirements
│   └── spec.md                # Approved technical blueprint
└── .gitignore
```

README and MIT licence are added at the appropriate shipping stage rather than expanding the application build.

## External Services and Dependencies
None.

There are no:
- APIs;
- databases;
- hosted services;
- API keys;
- npm runtime packages;
- paid dependencies.

## Important Failure Modes

- **Deadline arithmetic crosses a daylight-saving change** → date-only calculations use UTC calendar components rather than elapsed milliseconds in local time, preventing a 23/25-hour day from changing the available-day count.
- **Invalid task/date/capacity input** → calculation is blocked and concise validation feedback is shown.
- **Required work exceeds capacity** → show **Impossible**, keep the negative tolerance value, and return no misleading beyond-deadline allocation.

## What Was Simplified and Why

- **Plain browser JavaScript** instead of React/Vue/Svelte — one screen does not justify framework setup or bundle tooling.
- **Node built-in server/test runner** instead of external packages — removes dependency installation and network risk.
- **No persistence** instead of local storage/database — persistence does not prove estimate tolerance.
- **Equal hours every calendar day** instead of calendars/working-day rules — preserves the approved hours-per-day model.
- **Sequential allocation** instead of optimisation/dependency scheduling — deterministic order is sufficient to prove the kernel.
- **Numeric continuum** instead of safe/fragile thresholds — avoids unsupported universal claims.

## Decisions and Open Issues

- **Stack choice:** vanilla HTML/CSS/JavaScript with Node built-ins only. Chosen to minimise build/setup risk and fit the strict time budget.
- **Build mode intention:** use `5-build` Fast mode while preserving verification after each meaningful slice.
- **Date uncertainty clarified:** the competition period includes the UK daylight-saving transition on 25/10/2026. Counting `milliseconds / 24 hours` in local time can be wrong around DST, so DeadlineFit uses date-only UTC arithmetic for day counts and increments while treating user dates as calendar dates rather than timestamps.
- **Tolerance visual:** visual contraction is proportional to remaining positive tolerance but carries no named universal risk band. Zero is the only semantic boundary; below zero is Impossible.
- **Optional +30% scenario:** remains deferred and must not be implemented before the core MVP is complete, polished, and tested.
- **Open issues:** none blocking `5-build`.
