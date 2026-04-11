"use client";

import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import ResetPassword from "@/features/auth/components/ResetPassword";

export default function ResetPasswordClient() {
  const { status, error, submit, navigateToLogin } = useResetPassword();
  return <ResetPassword status={status} error={error} onSubmit={submit} onNavigateToLogin={navigateToLogin} />;
}