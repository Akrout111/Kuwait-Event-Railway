import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { verifyCsrfToken } from "@/lib/csrf";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Check if Clerk is properly configured with valid keys.
 * Returns false if keys are missing, placeholder, or not in pk_/sk_ format.
 */
function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!(key && key.startsWith("pk_") && !key.includes("placeholder"));
}

// Protected routes that require authentication
const PROTECTED_PATTERNS = [
  "/dashboard",
  "/bookings",
  "/profile",
  "/api/v1/bookings",
  "/api/v1/payments",
  "/api/v1/upload",
  "/api/v1/users",
  "/api/v1/notifications",
  "/api/v1/tickets",
  "/api/v1/reviews",
  "/api/v1/dashboard",
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((pattern) => pathname.startsWith(pattern));
}

/**
 * CSRF protection for state-changing API requests.
 * STRICT MODE: Missing token = BLOCKED
 *
 * - Skips non-mutation methods (GET, HEAD, OPTIONS)
 * - Skips webhook and cron endpoints (server-to-server)
 * - Skips the CSRF token issuance endpoint
 * - Skips auth routes that use Bearer token auth (not cookie-based)
 * - If a token is provided but invalid → 403
 * - If no token is provided → 403 (strict mode)
 */
function checkCsrf(req: NextRequest): NextResponse | null {
  const method = req.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return null;
  }

  const { pathname } = req.nextUrl;

  // Only apply to /api/v1/ routes
  if (!pathname.startsWith("/api/v1/")) {
    return null;
  }

  // Skip the CSRF token endpoint itself (it issues tokens)
  if (pathname === "/api/v1/csrf-token") {
    return null;
  }

  // Skip webhooks (they come from external services, not browsers)
  if (pathname.startsWith("/api/v1/webhooks/")) {
    return null;
  }

  // Skip cron endpoints (server-to-server)
  if (pathname.startsWith("/api/cron/")) {
    return null;
  }

  // Skip auth routes that use Bearer token auth (not cookie-based)
  // These are called before a CSRF token is available
  if (pathname === "/api/v1/auth/login") return null;
  if (pathname === "/api/v1/auth/register") return null;
  if (pathname === "/api/v1/auth/forgot-password") return null;

  const token = req.headers.get("X-CSRF-Token");
  if (!token) {
    // NO TOKEN = BLOCK (strict mode)
    return NextResponse.json(
      { success: false, error: { code: "CSRF_REQUIRED", message: "CSRF token required" } },
      { status: 403 }
    );
  }
  if (!verifyCsrfToken(token)) {
    return NextResponse.json(
      { success: false, error: { code: "CSRF_INVALID", message: "Invalid CSRF token" } },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Next.js 16 Proxy (formerly Middleware) — handles CSRF, auth, and i18n routing.
 *
 * This proxy works independently of Clerk. When Clerk is configured,
 * it dynamically imports and checks auth. When not configured, the proxy
 * handles CSRF + i18n only, and individual routes handle auth via getCurrentUser().
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. CSRF check for API mutation requests
  const csrfResult = checkCsrf(req);
  if (csrfResult) return csrfResult;

  // 2. Protected route auth check
  if (isProtectedRoute(pathname)) {
    if (isClerkConfigured()) {
      // Let Clerk handle auth — import dynamically
      try {
        const { auth } = await import("@clerk/nextjs/server");
        const { userId } = await auth();
        if (!userId && pathname.startsWith("/api")) {
          return NextResponse.json(
            { error: "UNAUTHORIZED", message: "Authentication required" },
            { status: 401 }
          );
        }
      } catch {
        // Clerk failed — fallback: individual API routes handle their own auth via getCurrentUser()
        // Page routes: redirect handled client-side by auth-provider
      }
    }
    // Custom auth: individual API routes handle their own auth via getCurrentUser()
    // Page routes: redirect handled client-side by auth-provider
  }

  // 3. i18n routing for non-API routes
  if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    return intlMiddleware(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
