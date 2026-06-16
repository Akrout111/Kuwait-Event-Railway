"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { User, Sparkles } from "lucide-react";

export function ProfilePageClient() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  return (
    <section className="relative py-8 overflow-hidden min-h-screen">
      {/* ── Interactive 3D Background ── */}
      <Section3DBg theme="footer" />

      {/* Theme-aware gradient overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] bg-background/70"
      />

      <div className="container mx-auto px-4 relative z-10 max-w-2xl">
        {/* Gold decorative line */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <Sparkles className="h-5 w-5 text-primary/60" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl gradient-text">{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("clerkSetupMessage")}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t("clerkSetupHint")}
              </p>
            </div>
            <div className="text-center">
              <Link href="/">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50">
                  {tCommon("home")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
