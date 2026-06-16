"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { SafeAuthContext, SafeUserProvider } from "@/hooks/use-safe-auth";

/**
 * ClerkAuthBridge — reads real Clerk auth state and provides it via SafeAuthContext.
 * Also fetches the user's role from the API.
 */
export function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const [fetchedRole, setFetchedRole] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string | null; email: string | null; avatarUrl: string | null; phone: string | null }>({
    name: null, email: null, avatarUrl: null, phone: null,
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    let cancelled = false;

    fetch("/api/v1/users/me")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data?.data) {
          setFetchedRole(data.data.role);
          setUserInfo({
            name: data.data.name ?? null,
            email: data.data.email ?? null,
            avatarUrl: data.data.avatarUrl ?? null,
            phone: null,
          });
        }
      })
      .catch(() => {
        // Silently fail — fetchedRole stays null
      });

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, userId]);

  const userRole = isSignedIn ? fetchedRole : null;

  return (
    <SafeAuthContext.Provider
      value={{
        isLoaded: isLoaded ?? false,
        isSignedIn: isSignedIn ?? false,
        userId: userId ?? null,
        userRole,
      }}
    >
      <SafeUserProvider value={userInfo}>
        {children}
      </SafeUserProvider>
    </SafeAuthContext.Provider>
  );
}
