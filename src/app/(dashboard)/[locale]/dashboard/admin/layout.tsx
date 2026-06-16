import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { AdminNav } from "@/components/features/admin/admin-nav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getServerUser();

  if (!user || user.role !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="space-y-6">
      <AdminNav />
      {children}
    </div>
  );
}
