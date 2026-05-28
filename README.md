# Project & Task Manager

A full-stack project and task management app with OTP-based authentication, built with Node.js + Express on the backend and React Native (Expo) on the frontend.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React Native (Expo), Redux Toolkit, React Navigation v6, Axios |
| **Backend** | Node.js, Express, PostgreSQL, pg (node-postgres) |
| **Auth** | OTP via console log (dev), JWT with 7-day expiry |
| **State** | Redux Toolkit + Redux Thunk (optimistic updates) |

## Project Structure

```
/
├── backend/          → Express REST API
│   ├── src/
│   │   ├── config/       → db.js (PostgreSQL pool)
│   │   ├── controllers/  → authController, projectController, taskController
│   │   ├── middleware/   → authMiddleware, errorHandler, validate
│   │   └── routes/       → index, auth, projects, tasks
│   ├── init.sql          → Database schema (users, projects, tasks)
│   └── server.js
└── mobile/           → Expo React Native app
    ├── src/
    │   ├── api/          → Axios client with interceptors
    │   ├── components/   → ProjectCard, TaskItem, SkeletonCard, etc.
    │   ├── constants/    → colors.js (light + dark palettes)
    │   ├── hooks/        → useThemeColors
    │   ├── navigation/   → AppNavigator (auth vs app stack)
    │   ├── screens/      → auth/, projects/, modals/
    │   └── store/        → Redux slices (auth, projects, tasks)
    └── App.js
```

## Setup — Backend

```bash
cd backend
npm install
cp .env.example .env       # Fill in your DB credentials and JWT_SECRET
```

Create the database and run migrations:

```bash
psql -U <your_pg_user> -c "CREATE DATABASE project_task_manager;"
psql -U <your_pg_user> -d project_task_manager -f init.sql
```

Start the server:

```bash
node server.js             # production
npm run dev                # development (--watch)
```

The server starts on `http://localhost:5050` by default.

## Setup — Mobile

```bash
cd mobile
npm install
```

Create `.env` (copy from `.env.example` or create manually):

```
EXPO_PUBLIC_API_URL=http://localhost:5050/api
```

> **Note for physical device**: replace `localhost` with your machine's local IP (e.g. `192.168.1.x`).

Start Expo:

```bash
npx expo start
```

Press `i` for iOS Simulator, `a` for Android emulator, or scan QR with Expo Go.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5050`) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |

### Mobile (`mobile/.env`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Full backend API base URL |

## Features

- **OTP Authentication** — passwordless login, JWT session persisted across restarts
- **Projects CRUD** — create, list, edit (long-press), delete with confirmation
- **Tasks CRUD** — create, toggle complete, edit (long-press), delete with confirmation
- **Optimistic Updates** — instant UI feedback on toggle and delete with auto-revert on error
- **Skeleton Loaders** — shimmer placeholders on first data fetch
- **FadeInDown Animations** — staggered entrance animations on list items
- **Haptic Feedback** — light impact on toggle, warning notification on delete
- **Search** — client-side search bar filters project list instantly
- **Task Filter Tabs** — All / Pending / Complete segmented control
- **Due Date Badges** — colour-coded Overdue (red) / Today (amber) / Upcoming (green)
- **Light & Dark Mode** — automatic switching based on system preference

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP, receive JWT |
| POST | `/api/auth/logout` | Stateless logout |

### Projects *(requires Bearer token)*
| Method | Route | Description |
|---|---|---|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get single project |
| PATCH | `/api/projects/:id` | Edit project |
| DELETE | `/api/projects/:id` | Delete project (cascades tasks) |

### Tasks *(requires Bearer token)*
| Method | Route | Description |
|---|---|---|
| GET | `/api/projects/:projectId/tasks` | List tasks |
| POST | `/api/projects/:projectId/tasks` | Create task |
| PATCH | `/api/projects/:projectId/tasks/:id` | Update task (title/status/due_date) |
| DELETE | `/api/projects/:projectId/tasks/:id` | Delete task |

## APK Build

```bash
npm install -g eas-cli
eas login
cd mobile
eas build:configure
eas build --platform android --profile preview
```

**APK Download:** [Add link after EAS build]

## Screenshots

[Add screenshots]

## Git Commit History

```
stage 1: backend foundation — express, postgres, health check
stage 2: otp auth — send-otp, verify-otp, jwt middleware
stage 3: projects and tasks crud api
stage 4: react native frontend — screens, navigation, axios
stage 5: redux — auth, projects, tasks slices with optimistic updates
stage 6: polish — animations, skeletons, search, filters, edit, apk
```
