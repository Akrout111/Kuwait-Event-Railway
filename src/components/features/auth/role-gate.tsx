"use client";

import { useSafeAuth } from "@/hooks/use-safe-auth";
import { useRouter } from "@/i18n/routing";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { isLoaded, isSignedIn, userRole } = useSafeAuth();
  const router = useRouter();

  if (!isLoaded) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (!isSignedIn) {
    router.push("/login");
    return null;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    router.push("/");
    return null;
  }

  return <>{children}</>;
}
