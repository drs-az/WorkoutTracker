const exercises = {
  'Flat Chest Press': 'weight-reps',
  'Incline Chest Press': 'weight-reps',
  'Tricep Extensions': 'weight-reps',
  'Push-ups': 'reps',
  'Leg Curls': 'weight-reps',
  'Stepper': 'weight-reps',
  'Bike Intervals': 'time',
  'Bicep Curls': 'weight-reps',
  'Hammer Curls': 'weight-reps',
  'Forearm Machine': 'weight-reps',
  'Bent-over Rows': 'weight-reps',
  'Overhead Press': 'weight-reps',
  'Lateral Raises': 'weight-reps',
  'Plank': 'time',
  'Crunches': 'reps'
};

function renderPlan() {
  const container = document.getElementById('workout-plan');
  container.innerHTML = '<h2>Log a New Exercise</h2>';

  const form = document.createElement('form');
  form.classList.add('exercise-log-form');
  form.innerHTML = `
    <label for="exercise-select">Select Exercise:</label>
    <select id="exercise-select">
      ${Object.keys(exercises).map(e => `<option value="${e}">${e}</option>`).join('')}
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
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      exercise,
      sets: Array.from(sets).map(set => ({
        reps: set.querySelector('.reps')?.value || null,
        weight: set.querySelector('.weight')?.value || null,
        time: set.querySelector('.time')?.value || null
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
  console.log("Form injected");

  setTimeout(() => generateSetInputs(), 0);

  document.getElementById('set-count').addEventListener('input', generateSetInputs);
  document.getElementById('exercise-select').addEventListener('change', generateSetInputs);
}

function generateSetInputs() {
  const select = document.getElementById('exercise-select');
  const countInput = document.getElementById('set-count');
  if (!select || !countInput) return;

  const count = parseInt(countInput.value);
  const exercise = select.value;
  const type = exercises[exercise];
  const inputContainer = document.getElementById('set-inputs');
  inputContainer.innerHTML = '';

  for (let i = 1; i <= count; i++) {
    let inputs = '';
    if (type === 'weight-reps') {
      inputs += 'Weight (lbs): <input type="number" class="weight" required> ';
      inputs += 'Reps: <input type="number" class="reps" required>';
    } else if (type === 'reps') {
      inputs += 'Reps: <input type="number" class="reps" required>';
    } else if (type === 'time') {
      inputs += 'Time (seconds): <input type="number" class="time" required>';
    }
    inputContainer.innerHTML += `
      <div class="set-input">
        <strong>Set ${i}</strong><br>
        ${inputs}<br><br>
      </div>
    `;
  }
}

function renderLogs() {
  const logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || [];
  const list = document.getElementById('log-list');
  list.innerHTML = '';

  const grouped = logs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});

  Object.keys(grouped).forEach(date => {
    const summary = document.createElement('li');
    const expand = document.createElement('button');
    expand.textContent = '+ ' + date;
    expand.className = 'toggle-button';

    const detailList = document.createElement('ul');
    detailList.style.display = 'none';

    grouped[date].forEach(log => {
      const setsText = log.sets.map((s, i) => {
        const parts = [];
        if (s.reps) parts.push(`${s.reps} reps`);
        if (s.weight) parts.push(`@ ${s.weight} lbs`);
        if (s.time) parts.push(`${s.time} sec`);
        return `Set ${i + 1}: ${parts.join(' ')}`;
      }).join(' | ');

      const item = document.createElement('li');
      item.innerHTML = `${log.exercise}: ${setsText} <br>
        <button onclick="editLog(${log.id})">Edit</button>
        <button onclick="deleteLog(${log.id})">Delete</button>`;
      detailList.appendChild(item);
    });

    expand.onclick = () => {
      const isVisible = detailList.style.display === 'block';
      detailList.style.display = isVisible ? 'none' : 'block';
      expand.textContent = (isVisible ? '+ ' : '- ') + date;
    };

    summary.appendChild(expand);
    summary.appendChild(detailList);
    list.appendChild(summary);
  });
}

function deleteLog(id) {
  let logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || [];
  logs = logs.filter(log => log.id !== id);
  localStorage.setItem('detailedWorkoutLogs', JSON.stringify(logs));
  renderLogs();
}

function editLog(id) {
  const logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || [];
  const log = logs.find(l => l.id === id);
  if (!log) return;

  document.getElementById('exercise-select').value = log.exercise;
  document.getElementById('set-count').value = log.sets.length;
  generateSetInputs();

  setTimeout(() => {
    const inputs = document.querySelectorAll('.set-input');
    log.sets.forEach((s, i) => {
      const input = inputs[i];
      if (s.weight) input.querySelector('.weight').value = s.weight;
      if (s.reps) input.querySelector('.reps').value = s.reps;
      if (s.time) input.querySelector('.time').value = s.time;
    });
  }, 0);

  deleteLog(id);
}

window.onload = () => {
  renderPlan();
  renderLogs();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
};
