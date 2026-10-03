const MS_PER_DAY = 86_400_000;

export function localTodayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) return null;
  return { year, month, day, utc };
}

export function countCalendarDaysInclusive(startISO, endISO) {
  const start = parseDateOnly(startISO);
  const end = parseDateOnly(endISO);
  if (!start || !end || end.utc < start.utc) return 0;
  return Math.floor((end.utc - start.utc) / MS_PER_DAY) + 1;
}


export function addCalendarDaysISO(startISO, offset) {
  const start = parseDateOnly(startISO);
  if (!start || !Number.isInteger(offset) || offset < 0) return null;
  const date = new Date(start.utc + offset * MS_PER_DAY);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function allocateTasks({ startDate, availableDays, hoursPerDay, tasks }) {
  const dailyCapacity = Number(hoursPerDay);
  const allocation = [];
  let dayIndex = 0;
  let remainingToday = dailyCapacity;

  for (const task of tasks) {
    let remainingTask = Number(task.hours);

    while (remainingTask > 1e-9) {
      if (dayIndex >= availableDays) return [];

      if (!allocation[dayIndex]) {
        allocation[dayIndex] = {
          date: addCalendarDaysISO(startDate, dayIndex),
          totalHours: 0,
          items: []
        };
      }

      const portion = Math.min(remainingTask, remainingToday);
      const roundedPortion = Number(portion.toFixed(10));
      allocation[dayIndex].items.push({ name: task.name, hours: roundedPortion });
      allocation[dayIndex].totalHours = Number((allocation[dayIndex].totalHours + roundedPortion).toFixed(10));
      remainingTask = Number((remainingTask - roundedPortion).toFixed(10));
      remainingToday = Number((remainingToday - roundedPortion).toFixed(10));

      if (remainingToday <= 1e-9 && remainingTask > 1e-9) {
        dayIndex += 1;
        remainingToday = dailyCapacity;
      } else if (remainingToday <= 1e-9) {
        dayIndex += 1;
        remainingToday = dailyCapacity;
      }
    }
  }

  return allocation.filter(Boolean);
}

export function validatePlanInput({ deadline, hoursPerDay, tasks, startDate }) {
  const errors = {};
  const parsedStart = parseDateOnly(startDate);
  const parsedDeadline = parseDateOnly(deadline);

  if (!parsedStart) errors.startDate = 'Current date could not be read.';
  if (!parsedDeadline) errors.deadline = 'Choose a valid deadline.';
  else if (parsedStart && parsedDeadline.utc < parsedStart.utc) {
    errors.deadline = 'Deadline cannot be before today.';
  }

  const daily = Number(hoursPerDay);
  if (!Number.isFinite(daily) || daily <= 0) {
    errors.hoursPerDay = 'Enter hours per day greater than 0.';
  }

  if (!Array.isArray(tasks) || tasks.length === 0) {
    errors.tasks = ['Add at least one task.'];
  } else {
    const taskErrors = tasks.map((task) => {
      const row = {};
      if (!String(task.name ?? '').trim()) row.name = 'Enter a task name.';
      const hours = Number(task.hours);
      if (!Number.isFinite(hours) || hours <= 0) row.hours = 'Enter hours greater than 0.';
      return row;
    });
    if (taskErrors.some((row) => Object.keys(row).length)) errors.tasks = taskErrors;
  }

  return errors;
}

export function buildPlan({ deadline, hoursPerDay, tasks, startDate = localTodayISO() }) {
  const errors = validatePlanInput({ deadline, hoursPerDay, tasks, startDate });
  if (Object.keys(errors).length) {
    const error = new Error('Invalid plan input');
    error.details = errors;
    throw error;
  }

  const normalizedTasks = tasks.map((task) => ({
    name: String(task.name).trim(),
    hours: Number(task.hours)
  }));
  const availableDays = countCalendarDaysInclusive(startDate, deadline);
  const requiredWork = normalizedTasks.reduce((sum, task) => sum + task.hours, 0);
  const availableCapacity = availableDays * Number(hoursPerDay);
  const rawTolerancePercent = (availableCapacity / requiredWork - 1) * 100;
  const tolerancePercent = Math.abs(rawTolerancePercent) < 1e-10 ? 0 : rawTolerancePercent;

  const status = tolerancePercent >= 0 ? 'feasible' : 'impossible';
  const allocation = status === 'feasible'
    ? allocateTasks({
        startDate,
        availableDays,
        hoursPerDay: Number(hoursPerDay),
        tasks: normalizedTasks
      })
    : [];

  return {
    status,
    startDate,
    deadline,
    availableDays,
    requiredWork,
    availableCapacity,
    tolerancePercent,
    allocation
  };
}
