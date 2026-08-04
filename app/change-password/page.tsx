import type {
  Metadata,
} from "next";

import ChangePasswordScreen from "@/components/auth/change-password-screen";

export const metadata:
  Metadata = {
    title:
      "Secure Your Account | GYM House",

    description:
      "Replace your temporary GYM House password with a private password.",
  };

export default function ChangePasswordPage() {
  return (
    <ChangePasswordScreen />
  );
}