"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AuthApiError,
  getCurrentAccount,
  logoutAccount,
  type AccountUser,
  type CustomerMembership,
} from "@/lib/auth-api";

type AuthContextValue = {
  user: AccountUser | null;
  membership: CustomerMembership | null;

  isLoading: boolean;
  isAuthenticated: boolean;

  refreshAuth: () => Promise<AccountUser | null>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

type AuthProviderProps = {
  children: ReactNode;
};

function isAuthenticationError(
  error: unknown,
) {
  return (
    error instanceof AuthApiError &&
    (error.status === 401 ||
      error.status === 403)
  );
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AccountUser | null>(null);

  const [membership, setMembership] =
    useState<CustomerMembership | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  /*
   * Used after login and whenever we manually
   * want to refresh the signed-in account.
   */
  const refreshAuth =
    useCallback(async () => {
      try {
        const response =
          await getCurrentAccount();

        setUser(response.user);
        setMembership(
          response.membership,
        );

        return response.user;
      } catch (error: unknown) {
        if (
          isAuthenticationError(error)
        ) {
          setUser(null);
          setMembership(null);

          return null;
        }

        console.error(
          "Unable to refresh authentication:",
          error,
        );

        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);

  /*
   * Check the existing session when the app
   * first loads.
   *
   * State updates happen inside asynchronous
   * Promise callbacks instead of synchronously
   * inside the Effect body.
   */
  useEffect(() => {
    let cancelled = false;

    getCurrentAccount()
      .then((response) => {
        if (cancelled) {
          return;
        }

        setUser(response.user);
        setMembership(
          response.membership,
        );
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (
          !isAuthenticationError(error)
        ) {
          console.error(
            "Unable to check authentication:",
            error,
          );
        }

        setUser(null);
        setMembership(null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const logout =
    useCallback(async () => {
      try {
        await logoutAccount();
      } catch (error: unknown) {
        console.error(
          "Unable to complete logout request:",
          error,
        );
      } finally {
        setUser(null);
        setMembership(null);
      }
    }, []);

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        membership,

        isLoading,
        isAuthenticated:
          user !== null,

        refreshAuth,
        logout,
      }),
      [
        user,
        membership,
        isLoading,
        refreshAuth,
        logout,
      ],
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}