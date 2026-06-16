// This layout is a pass-through.
// The actual layout with Navbar + Footer is in [locale]/layout.tsx
// because NextIntlClientProvider is only available inside [locale].
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
