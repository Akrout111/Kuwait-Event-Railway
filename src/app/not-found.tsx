import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <p className="text-xl mb-6 text-foreground">{t("notFound")}</p>
        <Link
          href="/"
          className="text-primary underline hover:text-primary/80 transition-colors"
        >
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
