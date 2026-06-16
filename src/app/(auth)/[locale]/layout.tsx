import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleUpdater } from "@/components/layout/locale-updater";
import { Toaster } from "@/components/ui/sonner";

export default async function AuthLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <>
      <LocaleUpdater locale={locale} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Top-right gold glow */}
            <div className="absolute -top-40 -end-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
            {/* Bottom-left gold glow */}
            <div className="absolute -bottom-40 -start-40 w-96 h-96 bg-primary/3 rounded-full blur-[120px]" />
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full">
            {children}
          </div>
        </div>
        <Toaster position="top-center" />
      </NextIntlClientProvider>
    </>
  );
}
