import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, countCalendarDaysInclusive, parseDateOnly, validatePlanInput } from '../src/planner.js';

test('parses valid date-only values and rejects impossible dates', () => {
  assert.equal(parseDateOnly('2026-10-03')?.day, 3);
  assert.equal(parseDateOnly('2026-02-31'), null);
});

test('counts calendar days inclusively', () => {
  assert.equal(countCalendarDaysInclusive('2026-10-03', '2026-10-03'), 1);
  assert.equal(countCalendarDaysInclusive('2026-10-03', '2026-10-05'), 3);
});

test('day counting remains correct across UK DST end', () => {
  assert.equal(countCalendarDaysInclusive('2026-10-24', '2026-10-26'), 3);
});

test('calculates the approved estimate tolerance formula', () => {
  const plan = buildPlan({
    startDate: '2026-10-03',
    deadline: '2026-10-04',
    hoursPerDay: 5,
    tasks: [{ name: 'Prototype', hours: 8 }]
  });
  assert.equal(plan.availableCapacity, 10);
  assert.equal(plan.requiredWork, 8);
  assert.equal(plan.tolerancePercent, 25);
  assert.equal(plan.status, 'feasible');
});

test('marks work over capacity as impossible and preserves negative tolerance', () => {
  const plan = buildPlan({
    startDate: '2026-10-03',
    deadline: '2026-10-04',
    hoursPerDay: 4,
    tasks: [{ name: 'Prototype', hours: 10 }]
  });
  assert.equal(plan.availableCapacity, 8);
  assert.ok(Math.abs(plan.tolerancePercent - (-20)) < 1e-9);
  assert.equal(plan.status, 'impossible');
});

test('increasing required work reduces tolerance deterministically', () => {
  const base = { startDate: '2026-10-03', deadline: '2026-10-04', hoursPerDay: 5 };
  const first = buildPlan({ ...base, tasks: [{ name: 'A', hours: 6 }] });
  const second = buildPlan({ ...base, tasks: [{ name: 'A', hours: 9.5 }] });
  assert.ok(second.tolerancePercent < first.tolerancePercent);
  assert.ok(second.tolerancePercent >= 0);
});

test('rejects past deadline, blank task and non-positive capacity', () => {
  const errors = validatePlanInput({
    startDate: '2026-10-03',
    deadline: '2026-10-02',
    hoursPerDay: 0,
    tasks: [{ name: '', hours: -1 }]
  });
  assert.match(errors.deadline, /before today/);
  assert.match(errors.hoursPerDay, /greater than 0/);
  assert.equal(errors.tasks[0].name, 'Enter a task name.');
  assert.equal(errors.tasks[0].hours, 'Enter hours greater than 0.');
});

test('allocates tasks sequentially, allowing spans and shared days', () => {
  const plan = buildPlan({
    startDate: '2026-10-03',
    deadline: '2026-10-05',
    hoursPerDay: 4,
    tasks: [
      { name: 'Research', hours: 6 },
      { name: 'Record', hours: 3 }
    ]
  });

  assert.equal(plan.status, 'feasible');
  assert.deepEqual(plan.allocation, [
    {
      date: '2026-10-03',
      totalHours: 4,
      items: [{ name: 'Research', hours: 4 }]
    },
    {
      date: '2026-10-04',
      totalHours: 4,
      items: [
        { name: 'Research', hours: 2 },
        { name: 'Record', hours: 2 }
      ]
    },
    {
      date: '2026-10-05',
      totalHours: 1,
      items: [{ name: 'Record', hours: 1 }]
    }
  ]);
});

test('allocation never exceeds daily capacity and allocates all feasible work', () => {
  const plan = buildPlan({
    startDate: '2026-10-03',
    deadline: '2026-10-06',
    hoursPerDay: 3.5,
    tasks: [
      { name: 'A', hours: 1.25 },
      { name: 'B', hours: 4.75 },
      { name: 'C', hours: 2 }
    ]
  });

  const totalAllocated = plan.allocation.flatMap((day) => day.items)
    .reduce((sum, item) => sum + item.hours, 0);
  assert.ok(plan.allocation.every((day) => day.totalHours <= 3.5 + 1e-9));
  assert.ok(Math.abs(totalAllocated - plan.requiredWork) < 1e-9);
  assert.deepEqual(
    plan.allocation.flatMap((day) => day.items).map((item) => item.name),
    ['A', 'B', 'B', 'C', 'C']
  );
});

test('impossible plans do not return a misleading allocation', () => {
  const plan = buildPlan({
    startDate: '2026-10-03',
    deadline: '2026-10-04',
    hoursPerDay: 4,
    tasks: [{ name: 'Too much work', hours: 9 }]
  });

  assert.equal(plan.status, 'impossible');
  assert.deepEqual(plan.allocation, []);
});

test('exact capacity is feasible with zero estimate tolerance', () => {
  const plan = buildPlan({
    startDate: '2026-10-03',
    deadline: '2026-10-04',
    hoursPerDay: 4,
    tasks: [{ name: 'Exact fit', hours: 8 }]
  });
  assert.equal(plan.status, 'feasible');
  assert.equal(plan.tolerancePercent, 0);
  assert.equal(plan.allocation.reduce((sum, day) => sum + day.totalHours, 0), 8);
});

test('decimal estimates remain fully allocated without exceeding daily capacity', () => {
  const plan = buildPlan({
    startDate: '2026-10-03',
    deadline: '2026-10-05',
    hoursPerDay: 2.5,
    tasks: [
      { name: 'A', hours: 1.1 },
      { name: 'B', hours: 3.2 }
    ]
  });
  const total = plan.allocation.flatMap((day) => day.items).reduce((sum, item) => sum + item.hours, 0);
  assert.ok(Math.abs(total - 4.3) < 1e-9);
  assert.ok(plan.allocation.every((day) => day.totalHours <= 2.5 + 1e-9));
});
