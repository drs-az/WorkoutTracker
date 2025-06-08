const exercises = { 'Flat Chest Press': 'weight-reps', 'Incline Chest Press': 'weight-reps', 'Tricep Extensions': 'weight-reps', 'Push-ups': 'reps',

'Leg Curls': 'weight-reps', 'Stepper': 'weight-reps', 'Bike Intervals': 'time',

'Bicep Curls': 'weight-reps', 'Hammer Curls': 'weight-reps', 'Forearm Machine': 'weight-reps', 'Bent-over Rows': 'weight-reps',

'Overhead Press': 'weight-reps', 'Lateral Raises': 'weight-reps', 'Plank': 'time', 'Crunches': 'reps' };

function renderPlan() { const container = document.getElementById('workout-plan'); container.innerHTML = '<h2>Log a New Exercise</h2>';

const form = document.createElement('form'); form.classList.add('exercise-log-form'); form.innerHTML = <label for="exercise-select">Select Exercise:</label> <select id="exercise-select"> ${Object.keys(exercises).map(e =><option value="${e}">${e}</option>`).join('')} </select><br><br>

<label for="set-count">How many sets?</label>
<input type="number" id="set-count" value="3" min="1" max="10"><br><br>

<div id="set-inputs"></div>

<button type="submit">Save Workout</button>

`;

form.onsubmit = function (e) { e.preventDefault(); const exercise = document.getElementById('exercise-select').value; const sets = document.querySelectorAll('.set-input'); const log = { date: new Date().toLocaleDateString(), exercise, sets: Array.from(sets).map(set => { const type = exercises[exercise]; return { reps: set.querySelector('.reps')?.value || null, weight: set.querySelector('.weight')?.value || null, time: set.querySelector('.time')?.value || null }; }) }; const logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || []; logs.unshift(log); localStorage.setItem('detailedWorkoutLogs', JSON.stringify(logs)); renderLogs(); form.reset(); document.getElementById('set-inputs').innerHTML = ''; };

container.appendChild(form);

function generateSetInputs() { const count = parseInt(document.getElementById('set-count').value); const exercise = document.getElementById('exercise-select').value; const type = exercises[exercise]; const inputContainer = document.getElementById('set-inputs'); inputContainer.innerHTML = ''; for (let i = 1; i <= count; i++) { let inputs = ''; if (type === 'weight-reps') { inputs += 'Weight (lbs): <input type="number" class="weight" required> '; inputs += 'Reps: <input type="number" class="reps" required>'; } else if (type === 'reps') { inputs += 'Reps: <input type="number" class="reps" required>'; } else if (type === 'time') { inputs += 'Time (seconds): <input type="number" class="time" required>'; } inputContainer.innerHTML += <div class="set-input"> <strong>Set ${i}</strong><br> ${inputs}<br><br> </div>; } }

document.getElementById('set-count').addEventListener('input', generateSetInputs); document.getElementById('exercise-select').addEventListener('change', generateSetInputs); generateSetInputs(); // Initial render }

function renderLogs() { const logs = JSON.parse(localStorage.getItem('detailedWorkoutLogs')) || []; const list = document.getElementById('log-list'); list.innerHTML = ''; logs.forEach(log => { const setsText = log.sets.map((s, i) => { const parts = []; if (s.reps) parts.push(${s.reps} reps); if (s.weight) parts.push(@ ${s.weight} lbs); if (s.time) parts.push(${s.time} sec); return Set ${i + 1}: ${parts.join(' ')}; }).join(' | '); const item = document.createElement('li'); item.textContent = ${log.date} – ${log.exercise}: ${setsText}; list.appendChild(item); }); }

window.onload = () => { renderPlan(); renderLogs(); if ('serviceWorker' in navigator) { navigator.serviceWorker.register('service-worker.js'); } };

