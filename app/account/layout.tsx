"use client";

import {
  useEffect,
  type ReactNode,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/components/providers/auth-provider";

type AccountLayoutProps = {
  children:
    ReactNode;
};

function RedirectScreen({
  destination,
}: {
  destination: string;
}) {
  const router =
    useRouter();

  useEffect(() => {
    router.replace(
      destination,
    );
  }, [
    destination,
    router,
  ]);

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#050605] text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#b7ef00]" />

        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
          Redirecting...
        </p>
      </div>
    </main>
  );
}

export default function AccountLayout({
  children,
}: AccountLayoutProps) {
  const {
    user,
    isLoading,
    mustChangePassword,
  } =
    useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#050605] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#b7ef00]" />

          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <RedirectScreen
        destination="/login"
      />
    );
  }

  if (
    user.role === "admin"
  ) {
    return (
      <RedirectScreen
        destination="/admin/dashboard"
      />
    );
  }

  if (mustChangePassword) {
    return (
      <RedirectScreen
        destination="/change-password"
      />
    );
  }

  return children;
}