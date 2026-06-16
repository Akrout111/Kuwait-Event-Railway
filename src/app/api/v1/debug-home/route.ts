import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * DEBUG-ONLY endpoint — exposes the real Prisma error message as JSON
 * so we can diagnose the homepage failure in production without needing
 * access to Railway logs.
 *
 * ⚠️ SECURITY: This endpoint reveals database schema errors. Remove it
 *    once the production site is stable.
 */

interface CheckResult {
  ok: boolean;
  ms?: number;
  preview?: string;
  error?: { name: string; message: string; stack?: string };
}

interface DebugResponse {
  timestamp: string;
  env: {
    DATABASE_URL_set: boolean;
    DATABASE_URL_prefix?: string;
    NODE_ENV?: string;
  };
  checks: Record<string, CheckResult>;
}

export async function GET() {
  const results: DebugResponse = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      DATABASE_URL_prefix: process.env.DATABASE_URL
        ?.split("@")[0]
        ?.replace(/:[^:@]+@/, ":***@"),
      NODE_ENV: process.env.NODE_ENV,
    },
    checks: {},
  };

  // Run each query the homepage runs, individually, catching errors so
  // we know exactly which one fails.
  const checks: Array<[string, () => Promise<unknown>]> = [
    [
      "events.findMany",
      () =>
        db.event.findMany({
          where: { isFeatured: true, status: "PUBLISHED", deletedAt: null },
          take: 6,
          orderBy: { startDate: "asc" },
        }),
    ],
    ["categories.findMany", () => db.category.findMany()],
    [
      "events.count",
      () =>
        db.event.count({
          where: {
            status: "PUBLISHED",
            deletedAt: null,
            startDate: { gte: new Date() },
          },
        }),
    ],
    ["venues.count", () => db.venue.count()],
    [
      "ticketTier.aggregate",
      () => db.ticketTier.aggregate({ _sum: { quantityTotal: true } }),
    ],
  ];

  for (const [name, fn] of checks) {
    try {
      const start = Date.now();
      const data = await fn();
      results.checks[name] = {
        ok: true,
        ms: Date.now() - start,
        // Truncate large responses
        preview: JSON.stringify(data).slice(0, 300),
      };
    } catch (err: unknown) {
      results.checks[name] = {
        ok: false,
        error:
          err instanceof Error
            ? {
                name: err.name,
                message: err.message,
                stack: err.stack?.split("\n").slice(0, 5).join("\n"),
              }
            : { name: "Unknown", message: String(err) },
      };
    }
  }

  return NextResponse.json(results, { status: 200 });
}
