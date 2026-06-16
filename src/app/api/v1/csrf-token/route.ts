import { successResponse } from "@/lib/api-response";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET() {
  const token = generateCsrfToken();
  return successResponse({ token }, "CSRF token generated");
}
