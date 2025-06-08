const exercises = [
  'Flat Chest Press', 'Incline Chest Press', 'Tricep Extensions', 'Push-ups',
  'Leg Curls', 'Stepper', 'Bike Intervals',
  'Bicep Curls', 'Hammer Curls', 'Forearm Machine', 'Bent-over Rows',
  'Overhead Press', 'Lateral Raises', 'Plank', 'Crunches'
];

function renderPlan() {
  const container = document.getElementById('workout-plan');
  container.innerHTML = '<h2>Log a New Exercise</h2>';

  const form = document.createElement('form');
  form.classList.add('exercise-log-form');
  form.innerHTML = `
    <label for="exercise-select">Select Exercise:</label>
    <select id="exercise-select">
      ${exercises.map(e => `<option value="${e}">${e}</option>`).join('')}
    </select><br><br>

    <label for="set-count">How many sets?</label>
    <input type="number" id="set-count" value="3" min="1" max="10"><br><br>

    <div id="set-inputs"></div>

    <button type="submit">Save Workout</button>
  `;

  form.onsubmit = function (e) {
    e.preventDefault();
    const exercise = document.getElementById('exercise-select').value;
    const sets = document.querySelectorAll('.set-input');
    const log = {
      date: new Date().toLocaleDateString(),
      exercise,
      sets: Array.from(sets).map(set => ({
        weight: set.querySelector('.weight').value,
        reps: set.querySelector('.reps').value
      }))
    };
    const logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || [];
    logs.unshift(log);
    localStorage.setItem('detailedWorkoutLogs', JSON.stringify(logs));
    renderLogs();
    form.reset();
    document.getElementById('set-inputs').innerHTML = '';
  };

  container.appendChild(form);

  document.getElementById('set-count').addEventListener('input', (e) => {
    const count = parseInt(e.target.value);
    const inputContainer = document.getElementById('set-inputs');
    inputContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      inputContainer.innerHTML += `
        <div class="set-input">
          <strong>Set ${i}</strong><br>
          Weight (lbs): <input type="number" class="weight" required>
          Reps: <input type="number" class="reps" required><br><br>
        </div>
      `;
    }
  });

  // Trigger initial rendering of set inputs
  document.getElementById('set-count').dispatchEvent(new Event('input'));
}

function renderLogs() {
  const logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || [];
  const list = document.getElementById('log-list');
  list.innerHTML = '';
  logs.forEach(log => {
    const setsText = log.sets.map((s, i) =>
      `Set ${i + 1}: ${s.reps} reps @ ${s.weight} lbs`
    ).join(' | ');
    const item = document.createElement('li');
    item.textContent = `${log.date} – ${log.exercise}: ${setsText}`;
    list.appendChild(item);
  });
}

window.onload = () => {
  renderPlan();
  renderLogs();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
};
