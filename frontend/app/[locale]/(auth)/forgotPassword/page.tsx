"use client";

import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import ForgotPassword from "@/features/auth/components/ForgotPassword";

export default function ForgotPasswordPage() {
  const { status, submit } = useForgotPassword();
  return <ForgotPassword status={status} onSubmit={submit} />;
}