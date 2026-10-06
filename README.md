<p align="center">
  <img src="public/logo.svg" alt="AyiPM" width="200" />
</p>

# AyiPM

AyiPM is an internal tool for running a small engineering team. It keeps people, attendance, leave, projects and tasks in one place, so we can stop tracking who is in today, who is on leave and who is working on what across spreadsheets and chat threads.

The app is a Next.js 14 frontend written in TypeScript. There is no backend yet: data lives in the browser's `localStorage` behind a store layer, so it can be swapped for an API without rewriting the pages.

## Features

- **Dashboard**: project and task statistics, project progress, upcoming and overdue deadlines, recent activity, and pending leave approvals for reviewers.
- **Team**: member directory with search and filters, member profiles, role changes, deactivation, and project assignment. New members are added by invitation.
- **Attendance**: check in and check out, with late arrivals and half days worked out from the workspace schedule. Includes a monthly summary and CSV export.
- **Leave**: leave requests, yearly balances, and approval or rejection by reviewers. Approved leave is written to attendance automatically.
- **Projects**: list and detail views. Progress is calculated from the project's tasks.
- **Tasks**: Kanban board with drag and drop, a filterable list view, comments, and a change history for every task.
- **Notifications and activity log**: notifications go to the people involved in a change; the activity log records every change for auditing.
- **Profile and settings**: profile photo, personal details, password changes, theme, date and time formats, notification preferences, and (for admins) workspace rules such as working hours and leave allowance.

## Roles

| | Admin | Project Manager | Employee |
| --- | :-: | :-: | :-: |
| Invite and manage team members | Yes | | |
| Change workspace settings | Yes | | |
| Create and edit projects | Yes | Yes | |
| Create, edit and assign tasks | Yes | Yes | |
| Move tasks on the board | Yes | Yes | Own tasks |
| Review leave requests | Yes | Yes | |
| View and export everyone's attendance | Yes | Yes | |
| View the full activity log | Yes | Yes | Own actions |
| Check in, request leave, comment on tasks | Yes | Yes | Yes |

Permissions are defined once in `src/constants/roles.ts`. The UI and the store actions both check them.

## Getting started

You need Node.js 18.17 or newer.

```bash
git clone https://github.com/mahfoos/AyiPM.git
cd AyiPM
npm install
npm run dev
```

Then open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npx tsc --noEmit` | Type-check without building |

`npm run lint` is defined, but ESLint has not been configured yet, so it will ask to set it up the first time.

## Accounts and sign-in

There is no public sign-up. Accounts work the way they do in tools like ClickUp or Jira:

1. An admin adds a person from **Team → Add member**. AyiPM creates an Employee ID and an invitation link that is valid for 7 days. The person shows as **Invited** until they accept it.
2. The person opens the link (`/accept-invite`), chooses a password and lands in the workspace.
3. After that, they sign in with their work email and password. "Keep me signed in" extends the session from 12 hours to 30 days.

If someone can't sign in, they use **Can't log in?** on the login page. This notifies the workspace admins, who can send a one-time reset link (valid for 30 minutes) from that person's profile.

After 5 failed attempts within 15 minutes, an account is locked for 15 minutes. Login errors never say whether an account exists.

Passwords are hashed in the browser with PBKDF2 through the Web Crypto API. This only works on `https://` or `localhost`.

## Known limitations

- **No backend yet.** All data is stored in the browser, so each browser has its own separate workspace.
- **No first account.** A fresh workspace has no accounts and there is no sign-up, so the first admin has to be created by the backend once it exists.
- **No email delivery.** Invitation and reset links are shown to the admin, who shares them manually.
- **No single sign-on.** Google and Microsoft sign-in need a server and aren't available yet.

## Project structure

```text
src/
├── app/                 Route files only; each page renders one feature view
├── features/<feature>/  Feature code: components/, hooks/, utils.ts, CSS modules
├── components/
│   ├── ui/              Shared building blocks (Button, Modal, Field, DataTable, ...)
│   ├── layout/          App shell, sidebar, navbar, route guarding
│   └── feedback/        Toasts and confirmation dialogs
├── store/               State, actions (one file per domain), selectors, hooks, persistence
├── hooks/               Generic React hooks
├── lib/                 Framework-free helpers (store engine, dates, CSV, crypto, validation)
├── constants/           Roles and permissions, status labels, navigation, defaults
└── types/               Domain types, one file per domain
```

A few rules keep the code consistent:

- Pages in `src/app` stay thin; the UI lives in `src/features`.
- Components read state through narrow selectors (`useAppStore(s => s.tasks)`, `useEmployeesById()`) and change it only through store actions. Actions validate input, check permissions and return `{ ok, data }` or `{ ok, error }`.
- Records refer to each other by id. A task stores `assigneeId`, not a copy of the assignee's name.
- Styles use a CSS module per component plus the design tokens in `src/app/globals.css`. Colours come from the grey palette defined there.

## Contributing

Work is tracked in GitHub issues, and every change goes through a pull request to `main`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow, branch and commit naming, and the review checklist.
