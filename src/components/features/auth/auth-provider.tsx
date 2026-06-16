"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import React from "react";
import { isClerkConfigured } from "./auth-utils-client";
import { ClerkAuthBridge } from "./clerk-auth-bridge";
import { CustomAuthBridge } from "./custom-auth-bridge";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isClerkConfigured()) {
    return (
      <ClerkProvider localization={arSA} afterSignOutUrl="/login">
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    );
  }
  return <CustomAuthBridge>{children}</CustomAuthBridge>;
}
