# Workout Tracker

This is a simple progressive web application (PWA) for tracking workouts. It runs entirely in the browser and stores data locally using `localStorage`.

## Features

- Log workouts with multiple sets for built‑in or custom exercises.
- Edit and delete previously saved logs.
- Bottom navigation menu for **Log**, **History**, and **Settings**.
- Custom exercises with selectable fields such as weight, reps and time, and an optional demonstration video link.
- Rename and manage custom exercises after creation.
- Export or import workout logs and custom exercises for backup.
- Filter workout history by exercise.
- Edit and save your name.
- Offline support via a service worker.

## Usage

1. Serve the project using any static web server (for example, `npx serve` or `python -m http.server`).
2. Open `index.html` in your browser.
3. Enter your first name when prompted. You can later edit it from **Settings**.
4. Use the bottom navigation menu to switch between **Log**, **History** (where you can filter by exercise), and **Settings**.
5. The **Settings** screen lets you export or import workout logs and custom exercises, rename custom exercises, edit your saved name, or clear all data.

All data is saved to the browser's local storage, so it persists between sessions but is specific to the browser you use.

## Development

The main files are:

- `index.html` – base HTML structure.
- `style.css` – styling for the application.
- `app.js` – logic for rendering workouts and managing local storage.
- `service-worker.js` and `manifest.json` – enable PWA functionality.

Feel free to customize the exercises or styling to fit your needs.
