# 🧠 Neurodivergent Task Manager

A neurodivergent-friendly task management app for better productivity, scheduling, and focus.

## 🚀 Features
- **Task Management:** Create, prioritize, and track tasks with AI-powered suggestions.
- **Smart Scheduling:** Automatically schedules tasks in available time slots.
- **Focus Mode:** Pomodoro timer & hyperfocus mode with reminders.
- **Cross-Platform:** Works on web (Next.js) and iOS (React Native).
- **Sync & Notifications:** Uses Firebase Auth & FCM/APNs for real-time updates.

## 📂 Folder Structure
<!-- FOLDER_STRUCTURE_START -->
```bash
│── .git
├── .gitignore
│── backend
│   ├── .gitignore
│   │── .vscode
│   │   ├── settings.json
│   ├── create_tables.sql
│   ├── defaultCatagories.sql
│   │── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── serviceAccountKey.json
│   │── src
│   │   │── config
│   │   │   ├── db.ts
│   │   │   ├── firebase.ts
│   │   │── controllers
│   │   │   ├── authController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── taskController.ts
│   │   │   ├── userController.ts
│   │   ├── cronJob.ts
│   │   │── middlewares
│   │   │   ├── authMiddleware.ts
│   │   │── models
│   │   │   ├── categoryModel.ts
│   │   │   ├── taskModel.ts
│   │   │   ├── userModel.ts
│   │   │── routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── taskRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   ├── server.ts
│   ├── tsconfig.json
├── package-lock.json
├── package.json
├── README.md
│── web
│   ├── .gitignore
│   │── .next
│   │── app
│   │   │── dashboard
│   │   │   ├── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   │── login
│   │   │   ├── page.tsx
│   │   ├── page.tsx
│   │   │── register
│   │   │   ├── page.tsx
│   │   │── tasks
│   │   │   ├── page.tsx
│   │── clear
│   │── components
│   │   ├── TaskCompletedTimeframe.tsx
│   │   ├── TaskTable.tsx
│   │   │── ui
│   │   │   ├── BasicSlider.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Button2.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ColourChangingSlider.tsx
│   │   │   ├── ImportanceSelector.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── RepeatTask.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TaskModal.tsx
│   │   │   ├── Toast.tsx
│   ├── eslint.config.mjs
│   │── hooks
│   │   ├── useFetchCompletedTasksTimeframe.ts
│   │   ├── useFetchTasks.ts
│   │── lib
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── authContext.tsx
│   │   ├── firebase.ts
│   │   ├── user.ts
│   ├── next.config.ts
│   │── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── postcss.config.mjs
│   │── public
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   ├── window.svg
│   ├── README.md
│   │── src
│   │── styles
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   │── types
│   │   ├── Task.d.ts
│   │   ├── userSettings.d.ts
├── web_file_structure.txt

```
<!-- FOLDER_STRUCTURE_END -->
## 🛠️ Tech Stack
- **Frontend:** Next.js (Web), React Native (Mobile)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Cloud) + SQLite (Offline)
- **Authentication:** Firebase Auth
- **Notifications:** Firebase Cloud Messaging (FCM) & Apple Push Notification Service (APNs)
