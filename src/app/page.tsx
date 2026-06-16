import { redirect } from "@/i18n/routing";
import { headers } from "next/headers";

export default function RootPage() {
  // Detect browser language preference and redirect accordingly
  const headersList = headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";
  const prefersAr = acceptLanguage.includes("ar");
  redirect(prefersAr ? "/ar" : "/en");
}
