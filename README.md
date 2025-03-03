# 🧠 Neurodivergent Task Manager

A neurodivergent-friendly task management app for better productivity, scheduling, and focus.

## 🚀 Features
- **Task Management:** Create, prioritize, and track tasks with AI-powered suggestions.
- **Smart Scheduling:** Automatically schedules tasks in available time slots.
- **Focus Mode:** Pomodoro timer & hyperfocus mode with reminders.
- **Cross-Platform:** Works on web (Next.js) and iOS (React Native).
- **Sync & Notifications:** Uses Firebase Auth & FCM/APNs for real-time updates.

## 📂 Folder Structure
```bash
neurodivergent-task-manager/
│── backend/                 # Node.js + Express + PostgreSQL Backend
│   ├── src/
│   │   ├── controllers/     # Handles API logic
│   │   ├── models/          # Database models/schema
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Authentication, logging, etc.
│   │   ├── config/          # Database & server configurations
│   │   ├── index.js         # Main server file
│   ├── package.json         # Backend dependencies
│   ├── .env.example         # Example environment variables
│── web/                     # Next.js Web App
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Next.js pages
│   │   ├── hooks/           # React Query & custom hooks
│   │   ├── styles/          # Tailwind CSS & global styles
│   ├── package.json         # Web dependencies
│   ├── .env.example         # Example environment variables
│── mobile/                  # React Native Mobile App
│   ├── src/
│   │   ├── screens/         # App screens
│   │   ├── components/      # Reusable UI components
│   │   ├── navigation/      # React Navigation setup
│   │   ├── storage/         # SQLite offline storage
│   ├── package.json         # Mobile dependencies
│── docs/                    # Documentation & resources
│   ├── architecture.md      # System architecture overview
│   ├── api-endpoints.md     # API Documentation
│   ├── ui-wireframes/       # UI wireframes/screenshots
│── .github/                 # GitHub-related files
│   ├── ISSUE_TEMPLATE.md    # GitHub issue template
│   ├── PULL_REQUEST_TEMPLATE.md  # PR template
│── .gitignore               # Files to ignore in Git
│── README.md                # Main project documentation
│── LICENSE                  # Project license
```
## 🛠️ Tech Stack
- **Frontend:** Next.js (Web), React Native (Mobile)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Cloud) + SQLite (Offline)
- **Authentication:** Firebase Auth
- **Notifications:** Firebase Cloud Messaging (FCM) & Apple Push Notification Service (APNs)
