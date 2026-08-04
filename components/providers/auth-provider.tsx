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
  type AuthRedirect,
  type CustomerMembership,
  type CurrentAccountResponse,
} from "@/lib/auth-api";

type AuthContextValue = {
  user:
    | AccountUser
    | null;

  membership:
    | CustomerMembership
    | null;

  mustChangePassword:
    boolean;

  redirectTo:
    | AuthRedirect
    | null;

  isLoading:
    boolean;

  isAuthenticated:
    boolean;

  /*
   * Keep this return type compatible with
   * the existing project.
   */
  refreshAuth:
    () =>
      Promise<
        AccountUser |
        null
      >;

  logout:
    () =>
      Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

type AuthProviderProps = {
  children:
    ReactNode;
};

function isUnauthenticatedError(
  error: unknown,
) {
  return (
    error instanceof
      AuthApiError &&
    error.status === 401
  );
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] =
    useState<AccountUser | null>(
      null,
    );

  const [
    membership,
    setMembership,
  ] =
    useState<CustomerMembership | null>(
      null,
    );

  const [
    mustChangePassword,
    setMustChangePassword,
  ] =
    useState(false);

  const [
    redirectTo,
    setRedirectTo,
  ] =
    useState<AuthRedirect | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const clearAuthState =
    useCallback(() => {
      setUser(
        null,
      );

      setMembership(
        null,
      );

      setMustChangePassword(
        false,
      );

      setRedirectTo(
        null,
      );
    }, []);

  const applyAuthResponse =
    useCallback(
      (
        response:
          CurrentAccountResponse,
      ) => {
        setUser(
          response.user,
        );

        setMembership(
          response.membership,
        );

        setMustChangePassword(
          response
            .mustChangePassword,
        );

        setRedirectTo(
          response.redirectTo,
        );
      },
      [],
    );

  /*
   * Refreshes every part of authentication
   * state, but returns only the user so it
   * remains compatible with the original
   * AuthContext API.
   */
  const refreshAuth =
    useCallback(async (): Promise<
      AccountUser | null
    > => {
      try {
        const response =
          await getCurrentAccount();

        applyAuthResponse(
          response,
        );

        return response.user;
      } catch (
        error: unknown
      ) {
        if (
          isUnauthenticatedError(
            error,
          )
        ) {
          clearAuthState();

          return null;
        }

        console.error(
          "Unable to refresh authentication:",
          error,
        );

        return null;
      } finally {
        setIsLoading(
          false,
        );
      }
    }, [
      applyAuthResponse,
      clearAuthState,
    ]);

  /*
   * Check the current session when the
   * application initially loads.
   */
  useEffect(() => {
    let cancelled =
      false;

    getCurrentAccount()
      .then(
        (
          response,
        ) => {
          if (cancelled) {
            return;
          }

          applyAuthResponse(
            response,
          );
        },
      )
      .catch(
        (
          error:
            unknown,
        ) => {
          if (cancelled) {
            return;
          }

          if (
            !isUnauthenticatedError(
              error,
            )
          ) {
            console.error(
              "Unable to check authentication:",
              error,
            );
          }

          clearAuthState();
        },
      )
      .finally(() => {
        if (!cancelled) {
          setIsLoading(
            false,
          );
        }
      });

    return () => {
      cancelled =
        true;
    };
  }, [
    applyAuthResponse,
    clearAuthState,
  ]);

  const logout =
    useCallback(async () => {
      try {
        await logoutAccount();
      } catch (
        error: unknown
      ) {
        console.error(
          "Unable to complete logout request:",
          error,
        );
      } finally {
        clearAuthState();
      }
    }, [
      clearAuthState,
    ]);

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        membership,
        mustChangePassword,
        redirectTo,

        isLoading,

        isAuthenticated:
          user !== null,

        refreshAuth,
        logout,
      }),
      [
        user,
        membership,
        mustChangePassword,
        redirectTo,
        isLoading,
        refreshAuth,
        logout,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}