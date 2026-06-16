"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Ticket,
  MessageSquare,
  Settings,
  Shield,
} from "lucide-react";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const tRole = useTranslations("role");
  const pathname = usePathname();
  const basePath = "/dashboard";

  const menuItems = [
    {
      href: basePath,
      label: t("nav.overview"),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `${basePath}/events`,
      label: t("nav.events"),
      icon: CalendarDays,
    },
    {
      href: `${basePath}/bookings`,
      label: t("nav.bookings"),
      icon: ClipboardList,
    },
    {
      href: `${basePath}/tickets`,
      label: t("nav.tickets"),
      icon: Ticket,
    },
    {
      href: `${basePath}/reviews`,
      label: t("nav.reviews"),
      icon: MessageSquare,
    },
    {
      href: `${basePath}/settings`,
      label: t("nav.settings"),
      icon: Settings,
    },
  ];

  // Admin-only items
  if (user.role === "ADMIN") {
    menuItems.push({
      href: `${basePath}/admin/overview`,
      label: t("nav.admin"),
      icon: Shield,
    });
  }

  return (
    <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 bg-white border-e lg:block">
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <CalendarDays className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">{tCommon("appName")}</span>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 inset-x-0 p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500">
              {user.role === "ADMIN" ? tRole("admin") : tRole("organizer")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
