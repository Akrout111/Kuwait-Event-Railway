import { redirect } from "@/i18n/routing";
import { headers } from "next/headers";

export default async function RootPage() {
  // Detect browser language preference and redirect accordingly
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";
  const prefersAr = acceptLanguage.includes("ar");
  redirect({ href: prefersAr ? "/ar" : "/en", locale: prefersAr ? "ar" : "en" });
}
