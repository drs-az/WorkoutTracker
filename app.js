let customExercises = JSON.parse(localStorage.getItem('customExercises')) || {};
let customExerciseVideos = JSON.parse(localStorage.getItem('customExerciseVideos')) || {};
let editingLogId = null;

function getOrAskName() {
  let name = localStorage.getItem('userFirstName');
  if (!name) {
    name = prompt('Welcome! What is your first name?');
    if (name) localStorage.setItem('userFirstName', name);
  }
  const title = name ? `${name}'s Workout Tracker` : 'Workout Tracker';
  document.getElementById('app-title').textContent = title;
}

function loadNameIntoSettings() {
  const input = document.getElementById('user-name');
  if (input) input.value = localStorage.getItem('userFirstName') || '';
}

function saveName() {
  const input = document.getElementById('user-name');
  if (!input) return;
  const name = input.value.trim();
  if (name) {
    localStorage.setItem('userFirstName', name);
  } else {
    localStorage.removeItem('userFirstName');
  }
  getOrAskName();
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
      <label for="exercise-select">Select Exercise (tap to reveal the exercise list):</label>
      <select id="exercise-select">
        ${Object.keys(getAllExercises()).map(e => `<option value="${e}">${e}</option>`).join('')}
      </select><br>
      <div id="video-link"></div><br>
      <a href="#" id="edit-video-link">Edit Video URL</a><br><br>

      <label for="set-count">How many sets?</label>
      <input type="number" id="set-count" value="3" min="1" max="10"><br><br>

      <div id="set-inputs"></div>
      <button type="submit">Save Workout</button>
    </form>
    <br>
    <button onclick="renderAddExerciseForm()">Add New Exercise</button>
    <button onclick="renderManageExercises()">Manage Custom Exercises</button>
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
  document.getElementById('set-count').addEventListener('input', () => generateSetInputs());
  document.getElementById('exercise-select').addEventListener('change', () => generateSetInputs());
  document.getElementById('edit-video-link').addEventListener('click', (e) => { e.preventDefault(); editVideoLink(); });
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

function renderManageExercises() {
  const container = document.getElementById('workout-plan');
  const names = Object.keys(customExercises);
  const list = names.map(n => `
      <li>${n}
        <button onclick="renameCustomExercise('${n.replace(/"/g, '&quot;')}')">Rename</button>
        <button onclick="deleteCustomExercise('${n.replace(/"/g, '&quot;')}')">Delete</button>
      </li>`).join('');
  container.innerHTML = `
    <h2>Manage Custom Exercises</h2>
    <ul>${list || '<li>No custom exercises added.</li>'}</ul>
    <br>
    <button onclick="renderPlan()">Back to Workout Logger</button>
  `;
}

function deleteCustomExercise(name) {
  delete customExercises[name];
  delete customExerciseVideos[name];
  localStorage.setItem('customExercises', JSON.stringify(customExercises));
  localStorage.setItem('customExerciseVideos', JSON.stringify(customExerciseVideos));
  renderManageExercises();
}

function renameCustomExercise(name) {
  const newName = prompt('New exercise name:', name);
  if (!newName || newName === name) return;
  if (customExercises[newName]) {
    alert('Exercise with that name already exists.');
    return;
  }
  customExercises[newName] = customExercises[name];
  delete customExercises[name];
  if (customExerciseVideos[name]) {
    customExerciseVideos[newName] = customExerciseVideos[name];
    delete customExerciseVideos[name];
  }
  localStorage.setItem('customExercises', JSON.stringify(customExercises));
  localStorage.setItem('customExerciseVideos', JSON.stringify(customExerciseVideos));
  renderManageExercises();
  renderPlan();
}

function generateSetInputs(linkOnly = false) {
  const select = document.getElementById('exercise-select');
  const countInput = document.getElementById('set-count');
  if (!select || !countInput) return;

  const videoLink = document.getElementById('video-link');
  if (videoLink) {
    const url = getExerciseVideo(select.value);
    videoLink.innerHTML = url ? `<a href="${url}" target="_blank">Exercise Video</a>` : '';
  }

  if (linkOnly) return;

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

function editVideoLink() {
  const select = document.getElementById('exercise-select');
  if (!select) return;
  const exercise = select.value;
  const current = getExerciseVideo(exercise);
  const url = prompt('Enter video URL:', current);
  if (url === null) return;

  if (url.trim()) {
    customExerciseVideos[exercise] = url.trim();
  } else {
    delete customExerciseVideos[exercise];
  }
  localStorage.setItem('customExerciseVideos', JSON.stringify(customExerciseVideos));
  generateSetInputs(true);
}

function renderLogs() {
  const logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || [];
  const list = document.getElementById('log-list');
  list.innerHTML = '';

  const filter = document.getElementById('log-filter');
  const term = filter ? filter.value.toLowerCase() : '';
  const visibleLogs = logs.filter(l => !term || l.exercise.toLowerCase().includes(term));

  const grouped = visibleLogs.reduce((acc, log) => {
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

function exportLogs() {
  const data = localStorage.getItem('detailedWorkoutLogs') || '[]';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workout-logs.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importLogsFromFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const incoming = JSON.parse(e.target.result);
      if (!Array.isArray(incoming)) throw new Error();
      const current = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || [];
      const combined = [...incoming, ...current];
      localStorage.setItem('detailedWorkoutLogs', JSON.stringify(combined));
      renderLogs();
    } catch (_) {
      alert('Invalid workout log file');
    }
  };
  reader.readAsText(file);
}

function exportExercises() {
  const data = JSON.stringify({ customExercises, customExerciseVideos });
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'custom-exercises.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importExercisesFromFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const incoming = JSON.parse(e.target.result);
      if (!incoming.customExercises || typeof incoming.customExercises !== 'object') throw new Error();
      customExercises = { ...customExercises, ...incoming.customExercises };
      customExerciseVideos = { ...customExerciseVideos, ...incoming.customExerciseVideos };
      localStorage.setItem('customExercises', JSON.stringify(customExercises));
      localStorage.setItem('customExerciseVideos', JSON.stringify(customExerciseVideos));
      renderPlan();
    } catch (_) {
      alert('Invalid custom exercise file');
    }
  };
  reader.readAsText(file);
}

function clearAllLogs() {
  if (confirm('Delete all workout logs?')) {
    localStorage.removeItem('detailedWorkoutLogs');
    renderLogs();
  }
}

function showSection(section) {
  const plan = document.getElementById('workout-plan');
  const history = document.getElementById('log-history');
  const settings = document.getElementById('settings');
  if (!plan || !history || !settings) return;

  plan.style.display = section === 'log' ? 'block' : 'none';
  history.style.display = section === 'history' ? 'block' : 'none';
  settings.style.display = section === 'settings' ? 'block' : 'none';

  if (section === 'settings') loadNameIntoSettings();

  document.getElementById('nav-log').classList.toggle('active', section === 'log');
  document.getElementById('nav-history').classList.toggle('active', section === 'history');
  document.getElementById('nav-settings').classList.toggle('active', section === 'settings');
}

window.onload = () => {
  getOrAskName();
  renderPlan();
  renderLogs();
  loadNameIntoSettings();

  const exportBtn = document.getElementById('export-logs');
  if (exportBtn) exportBtn.onclick = exportLogs;
  const importInput = document.getElementById('import-logs');
  if (importInput) importInput.addEventListener('change', e => {
    if (e.target.files[0]) importLogsFromFile(e.target.files[0]);
    e.target.value = '';
  });
  const clearBtn = document.getElementById('clear-logs');
  if (clearBtn) clearBtn.onclick = clearAllLogs;

  const exportEx = document.getElementById('export-exercises');
  if (exportEx) exportEx.onclick = exportExercises;
  const importEx = document.getElementById('import-exercises');
  if (importEx) importEx.addEventListener('change', e => {
    if (e.target.files[0]) importExercisesFromFile(e.target.files[0]);
    e.target.value = '';
  });
  const saveNameBtn = document.getElementById('save-name');
  if (saveNameBtn) saveNameBtn.onclick = saveName;
  const filterInput = document.getElementById('log-filter');
  if (filterInput) filterInput.addEventListener('input', renderLogs);

  const navLog = document.getElementById('nav-log');
  const navHistory = document.getElementById('nav-history');
  const navSettings = document.getElementById('nav-settings');
  if (navLog) navLog.onclick = () => showSection('log');
  if (navHistory) navHistory.onclick = () => { renderLogs(); showSection('history'); };
  if (navSettings) navSettings.onclick = () => showSection('settings');
  showSection('log');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
};
