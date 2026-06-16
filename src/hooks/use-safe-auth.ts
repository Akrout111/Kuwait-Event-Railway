"use client";

import { createContext, useContext } from "react";

/**
 * Safe auth state interface.
 * Works both when Clerk is configured and when it's not.
 */
interface SafeAuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  userRole: string | null;
  /** Custom auth sign in (available when Clerk is not configured) */
  signIn?: (email: string, password: string) => Promise<{ id: string; name: string; email: string; role: string }>;
  /** Custom auth sign up (available when Clerk is not configured) */
  signUp?: (name: string, email: string, password: string, phone?: string) => Promise<{ id: string; name: string; email: string; role: string }>;
  /** Custom auth sign out (available when Clerk is not configured) */
  signOut?: () => void;
}

/** Default state when Clerk is not configured (demo/preview mode) */
const DEFAULT_AUTH_STATE: SafeAuthState = {
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  userRole: null,
};

/**
 * Context that bridges auth state to consumers.
 */
export const SafeAuthContext = createContext<SafeAuthState>(DEFAULT_AUTH_STATE);

/**
 * Safe auth hook that works even when Clerk is not configured.
 * Returns mock auth state when Clerk keys are missing.
 * Returns real Clerk auth state when Clerk keys are present.
 */
export function useSafeAuth(): SafeAuthState {
  return useContext(SafeAuthContext);
}

/**
 * Safe user info interface.
 * Basic user profile data available when signed in.
 */
interface SafeUserInfo {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  phone: string | null;
}

const DEFAULT_USER_INFO: SafeUserInfo = {
  name: null,
  email: null,
  avatarUrl: null,
  phone: null,
};

const SafeUserContext = createContext<SafeUserInfo>(DEFAULT_USER_INFO);

export const SafeUserProvider = SafeUserContext.Provider;

/**
 * Safe user hook that provides basic user info.
 * Works with both Clerk and custom auth systems.
 */
export function useSafeUser(): SafeUserInfo {
  return useContext(SafeUserContext);
}
