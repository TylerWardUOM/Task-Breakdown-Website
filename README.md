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
├── apps
│   ├── web
│   │   ├── .gitignore
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

## ✅ Quick restart plan (no paid hosting)
You can run and deploy this project fully on free tiers:

1. **Frontend (free):** Vercel Hobby plan (`apps/web`)
2. **Backend API + Postgres (free):** Railway free trial, or switch to Render (free web service) + Neon/Supabase Postgres free tier
3. **Auth (free):** Firebase Authentication Spark plan

## 🔧 Local setup
1. Install dependencies from repo root:
   ```bash
   npm install
   ```
2. Copy environment templates:
   - Create `apps/web/.env.local` and add the variables shown below
   - `backend/.env.example` → `backend/.env`
3. Fill in your Firebase and database values.
4. Start backend:
   ```bash
   cd backend && npm start
   ```
5. Start web app:
   ```bash
   cd apps/web && npm run dev
   ```

## 🧪 Build note
With missing Firebase env vars, `next build` no longer crashes on auth route module import. Auth endpoints now return a clear `503 auth/misconfigured` response until `NEXT_PUBLIC_FIREBASE_*` values are set.

### `apps/web/.env.local` (example)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
RAILWAY_DEPLOYMENT_DRAINING_SECONDS=
PORT=
DATABASE_PUBLIC_URL=
FIREBASE_SERVICE_ACCOUNT=
FIREBASE_SERVICE_ACCOUNT_JSON=
OPENAI_API_KEY=
```

## 🔐 GitHub Environments (for all hosted secrets/variables)
Store runtime config in a GitHub Environment instead of repository-level plaintext files.

1. Create environment: **Settings → Environments → New environment** (recommended name: `production`).
2. Add **Environment variables**:
   - `RAILWAY_DEPLOYMENT_DRAINING_SECONDS`
   - `PORT`
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
3. Add **Environment secrets**:
   - `DATABASE_PUBLIC_URL`
   - `FIREBASE_SERVICE_ACCOUNT`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `OPENAI_API_KEY`
   - Note: CI reads `FIREBASE_SERVICE_ACCOUNT` (with fallback to `FIREBASE_SERVICE_ACCOUNT_JSON`); runtime code supports both names for backward compatibility.
4. CI now reads from this environment in `.github/workflows/ci.yml`.

## ▲ Vercel environment settings (if repo env files are required)
Vercel can build with env files in the repo, but only for values not already defined in Vercel project settings.

1. In Vercel: **Project → Settings → Environment Variables**.
2. For any key you want sourced from git-based env files, remove that key from Vercel Environment Variables (or keep the same value in both places).
3. Commit the required env file for the web app (typically `apps/web/.env.production`) with non-secret values only.
4. Keep secrets (`FIREBASE_SERVICE_ACCOUNT`, `OPENAI_API_KEY`, etc.) in Vercel/GitHub secrets and do not commit them to git.
