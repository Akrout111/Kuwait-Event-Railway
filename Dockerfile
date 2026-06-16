# ─────────────────────────────────────────────────────────────
# Kuwait Events Platform — Railway-ready Dockerfile
# Multi-stage build: deps → builder → runner (PostgreSQL + Next.js standalone)
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ──
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build ──
FROM oven/bun:1 AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (needs schema before build)
RUN bunx prisma generate

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

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone Next.js build (already includes server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files needed at runtime (migrations + schema)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Copy seed file for optional seeding
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

# Entrypoint: run migrations, then start the Next.js server
# Uses a shell form so we can chain commands; tini handles signals cleanly
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh", "-c", "bunx prisma migrate deploy && bun server.js"]
