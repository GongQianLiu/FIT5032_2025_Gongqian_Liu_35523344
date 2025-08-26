# Evergreen Way — Elderly Charity Service Platform

A modern Vue 3 + Firebase web app connecting elderly users and volunteers to facilitate community support.

## Features

- Role-based access: Elderly, Volunteer, Admin
- Task publishing and management
- Volunteer rating and feedback
- Real-time notifications
- Interactive data tables (sort, filter, paginate)
- Email notifications (serverless function)
- AI assistant integration (SiliconFlow)

## Tech Stack

- Frontend: Vue 3, Vite, Bootstrap 5
- Backend: Firebase (Firestore, Functions, Hosting)
- Auth: Firebase Authentication
- Email: Serverless function (`netlify/functions/send-email.js` or Firebase Functions)
- AI: SiliconFlow API

## Quick Start

Prerequisites:
- Node.js 18+
- npm or yarn
- Firebase CLI (for Hosting/Functions)

Setup:
```bash
git clone <repository-url>
cd old_Service_system
npm install
```

Configure:
- Update Firebase config in `src/firebase/config.js`.
- For AI features, set Functions env:
  ```bash
  firebase functions:config:set siliconflow.api_key="YOUR_SILICONFLOW_API_KEY"
  ```
- For email, see `netlify/functions/send-email.js` and the guides in root docs.

Run locally:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Deploy (Firebase Hosting):
```bash
firebase deploy
```

## Project Structure (brief)

```
src/
├─ components/   # UI components (tables, email, AI assistant)
├─ views/        # Pages (Dashboards, Management, Maps, etc.)
├─ services/     # Auth, Firestore, Email, AI, Maps
├─ firebase/     # Client Firebase config
├─ router/       # Routes
└─ stores/       # State (auth)
```

## Documentation

- Deployment: `DEPLOYMENT.md`
- Firebase setup: `FIREBASE_SETUP_GUIDE.md`, `FIREBASE_SETUP.md`
- AI integration: `SILICON_FLOW_API_GUIDE.md`
- Email setup: `POSTMARK_SETUP_GUIDE.md`, `REAL_EMAIL_LOGGING_IMPLEMENTATION.md`

## License

For academic coursework use; see repository license if provided.


