# Workout Tracker

This is a simple progressive web application (PWA) for tracking workouts. It runs entirely in the browser and stores data locally using `localStorage`.

## Features

- Log workouts with multiple sets for built‑in or custom exercises.
- Edit and delete previously saved logs.
- Custom exercises with selectable fields such as weight, reps and time, and an optional demonstration video link.
- Optional video links for each exercise, including editable links for default exercises via the "Edit Video URL" button.
- Offline support via a service worker.

## Usage

1. Serve the project using any static web server (for example, `npx serve` or `python -m http.server`).
2. Open `index.html` in your browser.
3. The app will prompt for your first name and then allow you to create or edit workout logs.

All data is saved to the browser's local storage, so it persists between sessions but is specific to the browser you use.

## Development

The main files are:

- `index.html` – base HTML structure.
- `style.css` – styling for the application.
- `app.js` – logic for rendering workouts and managing local storage.
- `service-worker.js` and `manifest.json` – enable PWA functionality.

Feel free to customize the exercises or styling to fit your needs.
