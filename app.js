let customExercises = JSON.parse(localStorage.getItem('customExercises')) || {};
let customExerciseVideos = JSON.parse(localStorage.getItem('customExerciseVideos')) || {};
let editingLogId = null;

function backupLocalData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-backup-${ts}.json`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getOrAskName() {
  let name = localStorage.getItem('userFirstName');
  if (!name) {
    name = prompt('Welcome! What is your first name?');
    if (name) {
      localStorage.setItem('userFirstName', name);
      backupLocalData();
    }
  }
  const title = name ? `${name}'s Workout Tracker` : 'Workout Tracker';
  document.getElementById('app-title').textContent = title;
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
    <button onclick="renderAddExerciseForm()">Add New Exercise</button><br><br>
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
    backupLocalData();

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
    backupLocalData();
  if (video) {
    customExerciseVideos[name] = video;
    localStorage.setItem('customExerciseVideos', JSON.stringify(customExerciseVideos));
    backupLocalData();
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
      <li>${n} <button onclick="deleteCustomExercise('${n.replace(/"/g, '&quot;')}')">Delete</button></li>`).join('');
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
  backupLocalData();
  renderManageExercises();
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

  const sanitized = sanitizeVideoUrl(url.trim());

  if (sanitized) {
    customExerciseVideos[exercise] = sanitized;
  } else {
    delete customExerciseVideos[exercise];
    if (url.trim()) alert('Video URL must start with http:// or https://');
  }
  localStorage.setItem('customExerciseVideos', JSON.stringify(customExerciseVideos));
  backupLocalData();
  generateSetInputs(true);
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
  backupLocalData();
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


function restoreBackupFromFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data !== 'object' || data === null) throw new Error();
      for (const [k, v] of Object.entries(data)) {
        localStorage.setItem(k, v);
      }
      // reload local variables
      customExercises = JSON.parse(localStorage.getItem('customExercises')) || {};
      customExerciseVideos = JSON.parse(localStorage.getItem('customExerciseVideos')) || {};
      renderPlan();
      renderLogs();
      getOrAskName();
      alert('Backup restored successfully');
    } catch (_) {
      alert('Invalid backup file');
    }
  };
  reader.readAsText(file);
}

function importExercisesFromFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const incoming = JSON.parse(e.target.result);
      if (typeof incoming !== 'object' || incoming === null) throw new Error();

      if (incoming.customExercises && typeof incoming.customExercises === 'object') {
        const existing = JSON.parse(localStorage.getItem('customExercises')) || {};
        for (const [name, fields] of Object.entries(incoming.customExercises)) {
          if (Array.isArray(fields) && fields.every(f => typeof f === 'string')) {
            existing[name] = fields;
          }
        }
        customExercises = existing;
        localStorage.setItem('customExercises', JSON.stringify(existing));
        backupLocalData();
      }

      if (incoming.customExerciseVideos && typeof incoming.customExerciseVideos === 'object') {
        const existingVideos = JSON.parse(localStorage.getItem('customExerciseVideos')) || {};
        for (const [name, url] of Object.entries(incoming.customExerciseVideos)) {
          const sanitized = sanitizeVideoUrl(url);
          if (sanitized) {
            existingVideos[name] = sanitized;
          }
        }
        customExerciseVideos = existingVideos;
        localStorage.setItem('customExerciseVideos', JSON.stringify(existingVideos));
        backupLocalData();
      }

      renderPlan();
    } catch (_) {
      alert('Invalid exercise file');
    }
  };
  reader.readAsText(file);
}


function showSection(section) {
  const sections = {
    log: document.getElementById('workout-plan'),
    history: document.getElementById('log-history'),
    settings: document.getElementById('settings')
  };
  Object.entries(sections).forEach(([key, el]) => {
    if (el) el.style.display = key === section ? 'block' : 'none';
  });

  const buttons = {
    log: document.getElementById('nav-log'),
    history: document.getElementById('nav-history'),
    settings: document.getElementById('nav-settings')
  };
  Object.entries(buttons).forEach(([key, btn]) => {
    if (btn) btn.classList.toggle('active', key === section);
  });
}

window.onload = () => {
  getOrAskName();
  renderPlan();
  renderLogs();

  showSection('log');

  const navLog = document.getElementById('nav-log');
  const navHistory = document.getElementById('nav-history');
  const navSettings = document.getElementById('nav-settings');
  if (navLog) navLog.onclick = () => { showSection('log'); renderPlan(); };
  if (navHistory) navHistory.onclick = () => { showSection('history'); renderLogs(); };
  if (navSettings) navSettings.onclick = () => { showSection('settings'); };

  const backupInput = document.getElementById('import-backup');
  if (backupInput) backupInput.addEventListener('change', e => {
    if (e.target.files[0]) restoreBackupFromFile(e.target.files[0]);
    e.target.value = '';
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
};
