"use client";

import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import VerifyEmail from "@/features/auth/components/VerifyEmail";

export default function VerifyEmailPage() {
  const { status, navigateHome } = useVerifyEmail();

  return <VerifyEmail status={status} onNavigateHome={navigateHome} />;
}