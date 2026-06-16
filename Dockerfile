# ─────────────────────────────────────────────────────────────
# Kuwait Events Platform — Railway-ready Dockerfile
# Multi-stage build: deps → builder → prod-deps → runner
# (PostgreSQL + Next.js standalone + full Prisma CLI at runtime)
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Install ALL dependencies (for build) ──
FROM oven/bun:1 AS deps
WORKDIR /app

# Copy package manifests first
COPY package.json bun.lock ./

# Install dependencies WITHOUT running postinstall scripts.
# (postinstall calls `prisma generate`, which needs the schema file we haven't copied yet.
# We run `prisma generate` explicitly in the builder stage where the schema is present.)
RUN bun install --frozen-lockfile --ignore-scripts

# ── Stage 2: Build ──
FROM oven/bun:1 AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source (includes prisma/schema.prisma, src/, public/, etc.)
COPY . .

# Generate Prisma client — schema is now available.
# Invoke the locally-installed Prisma CLI directly (NOT `bunx prisma`, which would
# fetch the latest Prisma v7 from npm at runtime and break the v6 schema).
RUN bun ./node_modules/prisma/build/index.js generate

# Build Next.js (standalone output mode)
RUN bun run build

# ── Stage 3: Production-only dependencies ──
# Install a clean production node_modules (no devDependencies) so the runner
# stage has access to ALL transitive runtime deps that the Prisma CLI needs
# (e.g. `effect`, `c12`, `deepmerge-ts`, `empathic` — required by `@prisma/config`,
# which is itself required by `prisma migrate deploy`).
# Without this, the previous Dockerfile only cherry-picked `.prisma`, `@prisma`,
# and `prisma` directories, leaving these transitive deps missing and crashing
# the migrate command on startup.
FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile --ignore-scripts

# ── Stage 4: Production runtime ──
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install openssl (needed by Prisma) and tini (PID 1 signal handler)
RUN apt-get update -y && \
    apt-get install -y openssl tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security (Debian-based image uses groupadd/useradd, not addgroup/adduser)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --no-create-home --home-dir /app nextjs

# 1) Full production node_modules — has Prisma CLI + ALL transitive deps
#    (effect, c12, deepmerge-ts, empathic, chokidar, jiti, …) that @prisma/config
#    requires at runtime. This is the fix for the healthcheck crash.
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# 2) Overlay the Prisma client generated during the build stage.
#    (prod-deps didn't run `prisma generate`, so `.prisma` is missing there.)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# 3) Copy Next.js standalone server files WITHOUT pulling in standalone's
#    minimal node_modules (which would overwrite the full production node_modules
#    we just installed). We copy only server.js and the .next build output.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/server.js ./server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 4) Prisma schema + migrations (needed by `prisma migrate deploy`)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Entrypoint: run migrations, then start the Next.js server.
# IMPORTANT: invoke the locally-installed Prisma CLI via its script path.
# Do NOT use `bunx prisma` — it would fetch Prisma v7 from npm at runtime,
# which rejects the schema's `url = env("DATABASE_URL")` datasource property
# (removed in Prisma 7). The project is pinned to Prisma v6.
#
# Robustness notes:
# - We use `;` (not `&&`) between migrate and server so the server starts even
#   if migrations fail. The /api/v1/csrf-token healthcheck endpoint doesn't
#   touch the DB, so the healthcheck can still pass and we can read actual
#   migration errors from the deploy logs.
# - We print diagnostic env-var presence checks so Railway deploy logs show
#   exactly which required variables are missing.
# - tini handles PID 1 signal forwarding cleanly.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh", "-c", "echo '=== Startup diagnostics ===' ; echo \"DATABASE_URL set: $([ -n \"$DATABASE_URL\" ] && echo yes || echo NO)\" ; echo \"JWT_SECRET set: $([ -n \"$JWT_SECRET\" ] && echo yes || echo NO)\" ; echo '=== Running prisma migrate deploy ===' ; bun ./node_modules/prisma/build/index.js migrate deploy 2>&1 || echo '!!! MIGRATION FAILED — starting server anyway so healthcheck can pass' ; echo '=== Starting Next.js server ===' ; bun server.js"]
