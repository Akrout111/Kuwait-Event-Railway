# ─────────────────────────────────────────────────────────────
# Kuwait Events Platform — Railway-ready Dockerfile
# Multi-stage build: deps → builder → runner (PostgreSQL + Next.js standalone)
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ──
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

# ── Stage 3: Production runtime ──
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

# Copy standalone Next.js build (already includes server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files needed at runtime (migrations + schema)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

USER nextjs

EXPOSE 3000

# Entrypoint: run migrations, then start the Next.js server.
# IMPORTANT: invoke the locally-installed Prisma CLI via its script path.
# Do NOT use `bunx prisma` — it would fetch Prisma v7 from npm at runtime,
# which rejects the schema's `url = env("DATABASE_URL")` datasource property
# (removed in Prisma 7). The project is pinned to Prisma v6.
# tini handles PID 1 signal forwarding cleanly.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh", "-c", "bun ./node_modules/prisma/build/index.js migrate deploy && bun server.js"]
