"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Users, CalendarDays, Tag, BarChart3 } from "lucide-react";

export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const basePath = "/dashboard/admin";

  const items = [
    {
      href: `${basePath}/overview`,
      label: t("nav.overview"),
      icon: BarChart3,
    },
    {
      href: `${basePath}/users`,
      label: t("nav.users"),
      icon: Users,
    },
    {
      href: `${basePath}/events`,
      label: t("nav.events"),
      icon: CalendarDays,
    },
    {
      href: `${basePath}/categories`,
      label: t("nav.categories"),
      icon: Tag,
    },
  ];

  return (
    <nav className="flex gap-1 border-b pb-px">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
