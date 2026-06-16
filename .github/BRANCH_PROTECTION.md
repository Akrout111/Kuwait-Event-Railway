# Branch Protection Rules

This document defines the branch protection rules for the Kuwait Events Platform repository.

## Main Branch Protection

The `main` branch is protected with the following rules:

### Required Checks

All pull requests targeting `main` must pass the following CI checks before merging:

1. **Lint & Type Check** — ESLint and TypeScript compiler must produce zero errors
2. **Test** — All unit tests must pass with minimum coverage thresholds:
   - Statements: 60%
   - Branches: 50%
   - Functions: 50%
   - Lines: 60%
3. **Build** — The Next.js production build must succeed
4. **Security Audit** — `bun audit` must pass (warnings are allowed)

### Merge Requirements

- **Require pull request reviews**: At least 1 approving review is required before merging
- **Dismiss stale reviews**: Reviews are dismissed when new commits are pushed
- **Require status checks**: All CI jobs must pass before merging
- **Require branches to be up to date**: The PR branch must be up to date with `main` before merging
- **Require signed commits**: Commits must be signed (GPG or SSH)

### Restricted Actions

- **No force pushes**: Force pushing to `main` is prohibited
- **No deletions**: The `main` branch cannot be deleted
- **No direct pushes**: All changes must go through a pull request

## Deploy Workflow

The `Deploy` workflow runs automatically on every push to `main`:

1. Installs dependencies
2. Builds the production bundle
3. Deploys to the production environment

## Feature Branch Naming Convention

Use the following prefixes for branch names:

- `feat/` — New features (e.g., `feat/booking-system`)
- `fix/` — Bug fixes (e.g., `fix/auth-redirect-loop`)
- `chore/` — Maintenance tasks (e.g., `chore/update-dependencies`)
- `refactor/` — Code refactoring (e.g., `refactor/api-helpers`)
- `docs/` — Documentation changes (e.g., `docs/api-reference`)
- `test/` — Test additions or fixes (e.g., `test/booking-validators`)

## Setting Up Branch Protection in GitHub

To configure these rules in the GitHub repository:

1. Navigate to **Settings → Branches → Branch protection rules**
2. Click **Add rule** for the `main` branch
3. Enable the following:
   - ☑ Require a pull request before merging (1 required review)
   - ☑ Dismiss stale pull request approvals when new commits are pushed
   - ☑ Require status checks to pass before merging
   - ☑ Require branches to be up to date before merging
   - Select required status checks: `Lint & Type Check`, `Test`, `Build`, `Security Audit`
   - ☑ Require signed commits
   - ☑ Do not allow force pushes
   - ☑ Do not allow deletions
4. Click **Create** or **Save changes**
