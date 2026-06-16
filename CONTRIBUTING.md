# Contributing Guide | دليل المساهمة

Thank you for your interest in contributing to the Kuwait Events Platform! This document provides guidelines and workflows for contributing to the project.

شكراً لاهتمامك بالمساهمة في منصة فعاليات الكويت! يوفر هذا المستند إرشادات وسير العمل للمساهمة في المشروع.

## Development Setup | إعداد بيئة التطوير

1. **Fork and clone** the repository
2. **Install dependencies**: `bun install`
3. **Set up environment**: `cp .env.example .env` and fill in your credentials
4. **Set up database**: `bun run db:push && bun run db:seed`
5. **Start dev server**: `bun run dev`

## Branch Naming Convention | اتفاقية تسمية الفروع

Use the following prefixes for branch names:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/booking-reminders` |
| `fix/` | Bug fix | `fix/payment-callback-error` |
| `refactor/` | Code refactoring | `refactor/auth-middleware` |
| `docs/` | Documentation | `docs/api-endpoints` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `test/` | Test additions/updates | `test/booking-validation` |
| `style/` | Code style changes | `style/format-event-card` |

## Commit Convention | اتفاقية الالتزام

We follow [Conventional Commits](https://www.conventionalcommits.org/). All commit messages are validated by commitlint.

نتبع [الالتزامات التقليدية](https://www.conventionalcommits.org/). يتم التحقق من جميع رسائل الالتزام بواسطة commitlint.

### Format | التنسيق

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types | الأنواع

| Type | Description |
|------|-------------|
| `feat` | New feature for the user |
| `fix` | Bug fix for the user |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, or auxiliary changes |
| `perf` | Performance improvements |

### Rules | القواعد

- **Subject** must not exceed 72 characters
- **Subject** must start with a lowercase letter
- **Subject** must not end with a period
- **Body** lines must not exceed 100 characters
- Use **imperative mood** in subject ("add feature" not "added feature")

### Examples | أمثلة

```
feat(bookings): add QR code ticket validation

Implement server-side ticket validation with HMAC-signed QR data.
The validation endpoint verifies ticket ownership and prevents
duplicate check-ins.

Closes #142
```

```
fix(payments): handle KNet callback signature verification

The payment callback was conditionally checking signatures, allowing
bypass in production. Now signature verification is mandatory for
all non-development environments.

Fixes #198
```

## Pull Request Process | عملية طلب السحب

1. **Create a feature branch** from `main` using the naming convention above
2. **Make your changes** with clear, conventional commits
3. **Test your changes** — ensure the dev server starts and your feature works
4. **Run linting**: `bun run lint` — fix any errors before pushing
5. **Push your branch** and create a Pull Request against `main`
6. **Describe your changes** in the PR description with:
   - What changed and why
   - How to test it
   - Any breaking changes or migration steps
7. **Address review feedback** promptly
8. **Ensure CI passes** before merge

## Code Style | أسلوب الكود

- **TypeScript strict mode** — no implicit any, no unused variables
- **ESLint** — follow the project's ESLint configuration
- **shadcn/ui** — use existing components instead of building from scratch
- **RTL support** — use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`)
- **i18n** — all user-facing strings must use translation keys from `src/messages/`

## API Design Guidelines | إرشادات تصميم واجهة برمجة التطبيقات

- Use standardized response format via `successResponse()` and `errorResponse()`
- All endpoints under `/api/v1/`
- Use proper HTTP status codes
- Add rate limiting to sensitive endpoints
- Validate all input with Zod schemas
- Use structured logging via `@/lib/logger`

## Questions? | أسئلة؟

Open an issue or reach out to the maintainers. We're happy to help!
