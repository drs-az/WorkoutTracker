const plan = {
  Monday: ['Flat Chest Press – 4x10', 'Incline Chest Press – 3x12', 'Tricep Extensions – 3x12', 'Push-ups – 2x15'],
  Tuesday: ['Leg Curls – 4x12', 'Stepper – 20 min', 'Bike Intervals – 10 min'],
  Wednesday: ['Light cardio or rest'],
  Thursday: ['Bicep Curls – 3x12', 'Hammer Curls – 3x10', 'Forearm Machine – 3x20', 'Bent-over Rows – 3x12'],
  Friday: ['Overhead Press – 3x10', 'Lateral Raises – 3x12', 'Plank – 3x 30s', 'Crunches – 3x15'],
  Saturday: ['Active recovery'],
  Sunday: ['Rest']
};

function renderPlan() {
  const container = document.getElementById('workout-plan');
  container.innerHTML = '<h2>Weekly Plan</h2>';
  for (const [day, exercises] of Object.entries(plan)) {
    const section = document.createElement('div');
    section.innerHTML = `<h3>${day}</h3><ul>${exercises.map(e => `<li>${e}</li>`).join('')}</ul>`;
    container.appendChild(section);
  }
}

function saveLog() {
  const input = document.getElementById('log-input').value;
  if (!input) return;
  const date = new Date().toLocaleDateString();
  const logs = JSON.parse(localStorage.getItem('workoutLogs')) || [];
  logs.unshift({ date, input });
  localStorage.setItem('workoutLogs', JSON.stringify(logs));
  document.getElementById('log-input').value = '';
  renderLogs();
}

function renderLogs() {
  const logs = JSON.parse(localStorage.getItem('workoutLogs')) || [];
  const list = document.getElementById('log-list');
  list.innerHTML = '';
  logs.forEach(log => {
    const item = document.createElement('li');
    item.textContent = `${log.date}: ${log.input}`;
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
