import type { Metadata } from "next";

import LoginScreen from "@/components/auth/login-screen";

export const metadata: Metadata = {
  title: "Member Login | GYM House",
  description:
    "Sign in to your GYM House member account.",
};

export default function LoginPage() {
  return <LoginScreen />;
}