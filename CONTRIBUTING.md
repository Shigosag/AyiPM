# Contributing to AyiPM

This guide covers how we work on AyiPM: how to pick up work, name branches and commits, open pull requests, and what reviewers check.

## Workflow

Every change, however small, follows the same path:

**issue → branch → commits → pull request → review → merge**

### 1. Start from an issue

All work starts from a GitHub issue. If there isn't one for what you want to do, open it first.

A good issue has:

- **A short, imperative title**, for example "Build Project Details Page" or "Fix leave balance after rejection".
- **A task checklist** that describes what "done" means.
- **The route it affects**, if any, for example `/projects/[id]`.
- **Labels**: an area label (`frontend`, `task`, `project`, `dashboard`, `user-management`, `settings`, `Authentication`) and a type label (`bug`, `enhancement`, `documentation`).

Assign the issue to yourself before you start, so two people don't pick up the same work.

### 2. Create a branch from the issue

Always branch from the latest `main`. Name the branch after the issue number and title:

```text
<issue-number>-<short-description>
```

For example `12-build-kanban-task-board` or `27-fix-leave-balance-after-rejection`.

The simplest way is the **Create a branch** link in the issue's sidebar on GitHub. It names the branch for you and links it to the issue. From the command line:

```bash
git checkout main
git pull
gh issue develop 12 --base main --checkout
```

Keep one issue per branch. If you find unrelated problems along the way, open a new issue for them instead of fixing them in the same branch.

### 3. Commit

Write commit messages in the [Conventional Commits](https://www.conventionalcommits.org/) style:

```text
<type>(<optional scope>): <summary in the present tense>
```

| Type | Use it for |
| --- | --- |
| `feat` | A new feature or user-visible behaviour |
| `fix` | A bug fix |
| `refactor` | Restructuring code without changing behaviour |
| `perf` | Performance improvements |
| `style` | Visual or CSS-only changes |
| `docs` | Documentation |
| `test` | Adding or changing tests |
| `chore` | Tooling, dependencies, clean-up |

Examples:

```text
feat(tasks): add drag and drop between Kanban columns
fix(leave): restore balance when a request is rejected
refactor(store): move invite links into their own module
```

Keep commits focused, and keep the summary line under about 72 characters. Add a body when the reason for a change isn't obvious from the code.

### 4. Open a pull request to `main`

Push your branch and open a pull request against `main`. The template asks for:

- **What changed and why**, in a few sentences.
- **The linked issue**, written as `Closes #12` so the issue closes automatically when the PR merges.
- **Screenshots** for UI changes, in light and dark mode.
- **How you tested it.**

Open the PR as a draft if you'd like early feedback. Mark it ready for review when the checklist below is done.

### 5. Review and merge

- Every PR needs at least one approval before it is merged.
- The author resolves review comments, or replies explaining why not.
- Merge only when the branch is up to date with `main` and the build passes.
- Delete the branch after merging.

## Before you ask for review

- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` succeeds.
- [ ] The change works in light and dark mode, and at phone width.
- [ ] Permissions are respected: try it as an admin, a project manager and an employee where it matters.
- [ ] Nothing in the code relies on placeholder data, test accounts or hardcoded people.
- [ ] No stray `console.log`, commented-out code or unused files.

## Code guidelines

The README describes the project structure. In practice:

- **Where code goes.** Route files in `src/app` only render a feature view. Feature UI lives in `src/features/<feature>/components`, feature hooks in `hooks/`, and pure helpers in `utils.ts`. Anything used by more than one feature belongs in `src/components/ui`, `src/hooks` or `src/lib`.
- **Reuse the UI kit.** Before writing a new button, modal, form field, table or empty state, check `src/components/ui`.
- **State.** Read state with narrow selectors (`useAppStore(s => s.projects)`, `useEmployeesById()`). Change it only through the actions in `src/store/actions`. Never read or write `localStorage` from a component.
- **Permissions.** Check permissions with `usePermission(...)` in the UI and `authorize(...)` in store actions. Hiding a button is not enough on its own.
- **Data.** Store ids, not copies. Resolve names and avatars through the id maps (`useEmployeesById`, `useProjectsById`).
- **Styling.** Use a CSS module next to the component, and the tokens in `globals.css` (`var(--text-primary)`, `var(--border-subtle)`, the `--gray-*` scale). Avoid large inline style objects and hardcoded colours.
- **Performance.** Memoise derived lists with `useMemo`, avoid `.find` or `.filter` inside loops over large lists, and keep per-second timers (`useNow`) inside small leaf components.
- **Comments.** Prefer clear names over comments. When a comment is needed, keep it to one line that explains *why*, not *what*.
- **Size.** If a component grows past roughly 200 lines, it is usually doing more than one job. Split it.

## Reporting bugs

Open an issue with the `bug` label. Include:

- What you did.
- What you expected to happen.
- What happened instead.
- Your browser.
- Screenshots or console errors, if you have them.
