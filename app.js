let customExercises = JSON.parse(localStorage.getItem('customExercises')) || {};
let customExerciseVideos = JSON.parse(localStorage.getItem('customExerciseVideos')) || {};
let editingLogId = null;

function getOrAskName() {
  let name = localStorage.getItem('userFirstName');
  if (!name) {
    name = prompt('Welcome! What is your first name?');
    if (name) localStorage.setItem('userFirstName', name);
  }
  document.getElementById('app-title').textContent = `${name || 'My'}'s Workout Tracker`;
}

const defaultExercises = {
  'Flat Chest Press': ['weight', 'reps'],
  'Incline Chest Press': ['weight', 'reps'],
  'Tricep Extensions': ['weight', 'reps'],
  'Push-ups': ['reps'],
  'Leg Curls': ['weight', 'reps'],
  'Stepper': ['weight', 'reps'],
  'Bike Intervals': ['time-seconds'],
  'Bicep Curls': ['weight', 'reps'],
  'Hammer Curls': ['weight', 'reps'],
  'Forearm Machine': ['weight', 'reps'],
  'Bent-over Rows': ['weight', 'reps'],
  'Overhead Press': ['weight', 'reps'],
  'Lateral Raises': ['weight', 'reps'],
  'Plank': ['time-seconds'],
  'Crunches': ['reps']
};

const defaultExerciseVideos = Object.fromEntries(
  Object.keys(defaultExercises).map(name => [
    name,
    `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' exercise')}`
  ])
);

function getAllExercises() {
  return { ...defaultExercises, ...customExercises };
}

function getExerciseVideo(name) {
  return customExerciseVideos[name] || defaultExerciseVideos[name] || '';
}

function sanitizeVideoUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch (_) {}
  return '';
}

function renderPlan() {
  const container = document.getElementById('workout-plan');
  container.innerHTML = `
    <h2>Log a New Exercise</h2>
    <form class="exercise-log-form" id="exercise-form">
      <label for="exercise-select">Select Exercise (tap to reveal the exercist list):</label>
      <select id="exercise-select">
        ${Object.keys(getAllExercises()).map(e => `<option value="${e}">${e}</option>`).join('')}
      </select><br>
      <div id="video-link"></div><br>

      <label for="set-count">How many sets?</label>
      <input type="number" id="set-count" value="3" min="1" max="10"><br><br>

      <div id="set-inputs"></div>
      <button type="submit">Save Workout</button>
    </form>
    <br>
    <button onclick="renderAddExerciseForm()">Add New Exercise</button>
  `;

  document.getElementById('exercise-form').onsubmit = function (e) {
    e.preventDefault();

    const exercise = document.getElementById('exercise-select').value;
    const sets = document.querySelectorAll('.set-input');

    const logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || [];

    const setData = Array.from(sets).map(set => ({
      reps: set.querySelector('.reps')?.value || null,
      weight: set.querySelector('.weight')?.value || null,
      time: set.querySelector('.time')?.value || null,
      seatPosition: set.querySelector('.seat-position')?.value || null,
      notes: set.querySelector('.notes')?.value || null
    }));

      if (editingLogId !== null) {
        const index = logs.findIndex(l => l.id === editingLogId);
        if (index !== -1) {
          logs[index] = { ...logs[index], exercise, sets: setData };
        }
        editingLogId = null;
        const submitBtn = document.querySelector('#exercise-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Save Workout';
      } else {
      const log = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        exercise,
        sets: setData
      };
      logs.unshift(log);
    }

    localStorage.setItem('detailedWorkoutLogs', JSON.stringify(logs));

    renderLogs();
    document.getElementById('set-inputs').innerHTML = '';
    e.target.reset();
  };

  generateSetInputs();
  document.getElementById('set-count').addEventListener('input', generateSetInputs);
  document.getElementById('exercise-select').addEventListener('change', generateSetInputs);
}

function renderAddExerciseForm() {
  const container = document.getElementById('workout-plan');
  container.innerHTML = `
    <h2>Add a Custom Exercise</h2>
    <form id="new-exercise-form">
      <label for="custom-exercise-name">Exercise Name:</label>
      <input type="text" id="custom-exercise-name" required><br><br>

      <label for="custom-exercise-video">Video URL:</label>
      <input type="url" id="custom-exercise-video" placeholder="https://"><br><br>

      <div>
        <strong>Select Fields:</strong><br><br>
        <div class="custom-field-row">
          <input type="checkbox" id="field-weight" value="weight">
          <label for="field-weight">Weight</label>
        </div>
        <div class="custom-field-row">
          <input type="checkbox" id="field-reps" value="reps">
          <label for="field-reps">Reps</label>
        </div>
        <div class="custom-field-row">
          <input type="checkbox" id="field-time-minutes" value="time-minutes">
          <label for="field-time-minutes">Time (minutes)</label>
        </div>
        <div class="custom-field-row">
          <input type="checkbox" id="field-time-seconds" value="time-seconds">
          <label for="field-time-seconds">Time (seconds)</label>
        </div>
        <div class="custom-field-row">
          <input type="checkbox" id="field-seat-position" value="seat-position">
          <label for="field-seat-position">Seat Position</label>
        </div>
        <div class="custom-field-row">
          <input type="checkbox" id="field-notes" value="notes">
          <label for="field-notes">Notes</label>
        </div>
      </div><br>

      <button type="submit">Add Exercise</button>
    </form>
    <br>
    <button onclick="renderPlan()">Back to Workout Logger</button>
  `;

  document.getElementById('new-exercise-form').onsubmit = function(e) {
    e.preventDefault();

  const name = document.getElementById('custom-exercise-name').value.trim();
  const rawVideo = document.getElementById('custom-exercise-video').value.trim();
  const video = sanitizeVideoUrl(rawVideo);
  const fields = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  if (!name || fields.length === 0) return;

    customExercises[name] = fields;
    localStorage.setItem('customExercises', JSON.stringify(customExercises));
  if (video) {
    customExerciseVideos[name] = video;
    localStorage.setItem('customExerciseVideos', JSON.stringify(customExerciseVideos));
  } else if (rawVideo) {
    alert('Video URL must start with http:// or https://');
  }
    renderPlan();
  };
}

function editCustomExerciseVideo(name) {
  const current = customExerciseVideos[name] || '';
  const url = prompt(`Edit video URL for ${name}:`, current);
  if (url === null) return; // cancelled
  if (url.trim()) {
    customExerciseVideos[name] = url.trim();
  } else {
    delete customExerciseVideos[name];
  }
  localStorage.setItem('customExerciseVideos', JSON.stringify(customExerciseVideos));
  generateSetInputs();
}

function generateSetInputs() {
  const select = document.getElementById('exercise-select');
  const countInput = document.getElementById('set-count');
  if (!select || !countInput) return;

  const videoLink = document.getElementById('video-link');
  if (videoLink) {
    const url = getExerciseVideo(select.value);
main
  }

  const count = parseInt(countInput.value);
  const exercise = select.value;
  const fields = getAllExercises()[exercise];
  const inputContainer = document.getElementById('set-inputs');
  inputContainer.innerHTML = '';

  for (let i = 1; i <= count; i++) {
    let inputs = '';

    if (fields.includes('weight')) {
      inputs += `<div class="set-input-row"><label>Weight (lbs): <input type="number" class="weight" required></label></div>`;
    }
    if (fields.includes('reps')) {
      inputs += `<div class="set-input-row"><label>Reps: <input type="number" class="reps" required></label></div>`;
    }
    if (fields.includes('time-minutes')) {
      inputs += `<div class="set-input-row"><label>Minutes: <input type="number" class="time" required></label></div>`;
    }
    if (fields.includes('time-seconds')) {
      inputs += `<div class="set-input-row"><label>Seconds: <input type="number" class="time" required></label></div>`;
    }
    if (fields.includes('seat-position')) {
      inputs += `<div class="set-input-row"><label>Seat Position: <input type="text" class="seat-position"></label></div>`;
    }
    if (fields.includes('notes')) {
      inputs += `<div class="set-input-row"><label>Notes: <input type="text" class="notes"></label></div>`;
    }

    inputContainer.innerHTML += `
      <div class="set-input">
        <strong>Set ${i}</strong><br>
        ${inputs}
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
      const setsText = log.sets
        .map((s, i) => {
          const parts = [];
          if (s.reps) parts.push(`${s.reps} reps`);
          if (s.weight) parts.push(`@ ${s.weight} lbs`);
          if (s.time) parts.push(`${s.time} sec`);
          if (s.seatPosition) parts.push(`Seat ${s.seatPosition}`);
          if (s.notes) parts.push(`Notes: ${s.notes}`);
          return `Set ${i + 1}: ${parts.join(' ')}`;
        })
        .join(' | ');

      const item = document.createElement('li');
      item.innerHTML = `
        ${log.exercise}: ${setsText} <br>
        <button onclick="editLog(${log.id})">Edit</button>
        <button onclick="deleteLog(${log.id})">Delete</button>
      `;
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

  editingLogId = id;

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
      if (s.seatPosition) input.querySelector('.seat-position').value = s.seatPosition;
      if (s.notes) input.querySelector('.notes').value = s.notes;
    });
  }, 0);

  const submitBtn = document.querySelector('#exercise-form button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Update Workout';
}

window.onload = () => {
  getOrAskName();
  renderPlan();
  renderLogs();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
};
