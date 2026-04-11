"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { resetPassword } from "@/services/auth";
import { href } from "@/navigation/nav";
import type { Locale } from "@/i18n/locales";

export function useResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(password: string, confirmPassword: string) {
    setError(null);

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (!token) {
      setError("Token fehlt.");
      return;
    }

    setStatus("submitting");
    try {
      await resetPassword(token, password);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Link ungültig oder abgelaufen.");
    }
  }

  const navigateToLogin = () => {
    router.push(href(locale as Locale, "home") + "/login");
  };

  return { status, error, submit, navigateToLogin };
}