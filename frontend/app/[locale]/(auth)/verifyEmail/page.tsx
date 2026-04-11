"use client";

import { useVerifyEmail } from "@/components/hooks/useVerifyEmail";
import VerifyEmail from "@/features/auth/VerifyEmail";

export default function VerifyEmailPage() {
  const { status, navigateHome } = useVerifyEmail();

  return <VerifyEmail status={status} onNavigateHome={navigateHome} />;
}