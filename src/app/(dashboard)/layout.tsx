// This layout is a pass-through.
// The actual layout with sidebar/header is in [locale]/layout.tsx
// because NextIntlClientProvider is only available inside [locale].
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
