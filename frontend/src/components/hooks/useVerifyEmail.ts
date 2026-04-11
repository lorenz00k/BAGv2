"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { verifyEmail } from "@/services/auth";
import { href } from "@/navigation/nav";
import type { Locale } from "@/i18n/locales";
import { useAuth } from "@/context/AuthContext";


export function useVerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const { refreshUser } = useAuth();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    verifyEmail(token)
      .then(async () => {
        setStatus("success");
        await refreshUser();
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const navigateHome = () => {
    router.push(href(locale as Locale, "home"));
  };

  return { status, navigateHome };
}