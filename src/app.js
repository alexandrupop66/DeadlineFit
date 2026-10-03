import { buildPlan, localTodayISO } from './planner.js';

const form = document.querySelector('#plan-form');
const taskList = document.querySelector('#task-list');
const addTaskButton = document.querySelector('#add-task');
const deadlineInput = document.querySelector('#deadline');
const hoursPerDayInput = document.querySelector('#hours-per-day');
const result = document.querySelector('#result');
let taskId = 0;

function taskRow(name = '', hours = '') {
  taskId += 1;
  const row = document.createElement('div');
  row.className = 'task-row';
  row.dataset.taskId = String(taskId);
  row.innerHTML = `
    <label class="field task-name-field">
      <span>Task</span>
      <input class="task-name" type="text" placeholder="e.g. Record demo" value="${escapeHtml(name)}" aria-label="Task name">
      <small class="field-error" data-error="name"></small>
    </label>
    <label class="field task-hours-field">
      <span>Estimated hours</span>
      <input class="task-hours" type="number" min="0.1" step="0.1" placeholder="2" value="${escapeHtml(hours)}" aria-label="Estimated hours">
      <small class="field-error" data-error="hours"></small>
    </label>
    <button type="button" class="remove-task" aria-label="Remove task">Remove</button>
  `;
  row.querySelector('.remove-task').addEventListener('click', () => {
    if (taskList.children.length === 1) {
      row.querySelector('.task-name').value = '';
      row.querySelector('.task-hours').value = '';
      return;
    }
    row.remove();
  });
  return row;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function readTasks() {
  return [...taskList.querySelectorAll('.task-row')].map((row) => ({
    name: row.querySelector('.task-name').value,
    hours: row.querySelector('.task-hours').value
  }));
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
  document.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'));
}

function showErrors(errors) {
  if (errors.deadline) {
    document.querySelector('[data-error="deadline"]').textContent = errors.deadline;
    deadlineInput.setAttribute('aria-invalid', 'true');
  }
  if (errors.hoursPerDay) {
    document.querySelector('[data-error="hoursPerDay"]').textContent = errors.hoursPerDay;
    hoursPerDayInput.setAttribute('aria-invalid', 'true');
  }
  if (Array.isArray(errors.tasks)) {
    const rows = [...taskList.querySelectorAll('.task-row')];
    errors.tasks.forEach((taskError, index) => {
      const row = rows[index];
      if (!row || typeof taskError !== 'object') return;
      for (const key of ['name', 'hours']) {
        if (taskError[key]) {
          row.querySelector(`[data-error="${key}"]`).textContent = taskError[key];
          row.querySelector(key === 'name' ? '.task-name' : '.task-hours').setAttribute('aria-invalid', 'true');
        }
      }
    });
  }
}

function formatHours(value) {
  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} h`;
}

function formatPercent(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

function reserveWidth(tolerance) {
  if (tolerance <= 0) return 0;
  return Math.min(100, (tolerance / (tolerance + 50)) * 100);
}

function formatDate(dateISO) {
  const [year, month, day] = dateISO.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function renderAllocation(plan) {
  if (plan.status !== 'feasible') {
    return `
      <div class="allocation-placeholder">
        <p class="eyebrow">Day-by-day plan</p>
        <p>No successful allocation is shown because the work does not fit before the deadline.</p>
      </div>
    `;
  }

  const usedDays = plan.allocation.length;
  const reserveDays = Math.max(0, plan.availableDays - usedDays);
  const days = plan.allocation.map((day) => `
    <article class="day-card">
      <div class="day-heading">
        <strong>${formatDate(day.date)}</strong>
        <span>${formatHours(day.totalHours)}</span>
      </div>
      <div class="day-items">
        ${day.items.map((item) => `
          <div class="allocation-item">
            <span>${escapeHtml(item.name)}</span>
            <strong>${formatHours(item.hours)}</strong>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('');

  return `
    <div class="allocation-section">
      <div class="allocation-title">
        <div>
          <p class="eyebrow">Day-by-day plan</p>
          <h3>Work fills each day in task order.</h3>
        </div>
        <span class="reserve-days">${reserveDays} reserve day${reserveDays === 1 ? '' : 's'}</span>
      </div>
      <div class="day-list">${days}</div>
    </div>
  `;
}


function renderResult(plan) {
  const feasible = plan.status === 'feasible';
  result.className = `result-panel ${plan.status}`;
  result.innerHTML = `
    <div class="result-heading">
      <div>
        <p class="eyebrow">Plan status</p>
        <h2>${feasible ? 'Feasible' : 'Impossible'}</h2>
      </div>
      <span class="status-pill">${feasible ? 'Fits deadline' : 'Over capacity'}</span>
    </div>

    <div class="metric-grid">
      <div class="metric"><span>Required work</span><strong>${formatHours(plan.requiredWork)}</strong></div>
      <div class="metric"><span>Available capacity</span><strong>${formatHours(plan.availableCapacity)}</strong></div>
      <div class="metric"><span>Available days</span><strong>${plan.availableDays}</strong></div>
    </div>

    <div class="tolerance-block">
      <div class="tolerance-copy">
        <span>Estimate tolerance</span>
        <strong>${formatPercent(plan.tolerancePercent)}</strong>
      </div>
      <div class="reserve-track" role="img" aria-label="Positive estimate tolerance reserve relative to zero">
        <div class="reserve-fill" style="width: ${reserveWidth(plan.tolerancePercent)}%"></div>
        <span class="zero-marker" aria-hidden="true"></span>
      </div>
      <p>${feasible
        ? 'Your estimates can grow by this aggregate percentage before the deadline stops fitting.'
        : 'Current estimated work already exceeds the capacity available before the deadline.'}</p>
    </div>

    ${renderAllocation(plan)}
  `;
}

addTaskButton.addEventListener('click', () => {
  const row = taskRow();
  taskList.append(row);
  row.querySelector('.task-name').focus();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  try {
    const plan = buildPlan({
      deadline: deadlineInput.value,
      hoursPerDay: hoursPerDayInput.value,
      tasks: readTasks(),
      startDate: localTodayISO()
    });
    renderResult(plan);
  } catch (error) {
    if (error?.details) {
      showErrors(error.details);
      document.querySelector('[aria-invalid="true"]')?.focus();
    }
  }
});

deadlineInput.min = localTodayISO();
taskList.append(taskRow());
