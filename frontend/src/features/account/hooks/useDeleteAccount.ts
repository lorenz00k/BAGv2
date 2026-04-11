"use client";

import { useState } from "react";
import { deleteAccount } from "@/services/account";
import { useAuth } from "@/context/AuthContext";

export function useDeleteAccount() {
  const { logout } = useAuth();
  const [status, setStatus] = useState<"idle" | "confirming" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function requestDelete() {
    setStatus("confirming");
    setError(null);
  }

  function cancel() {
    setStatus("idle");
    setError(null);
  }

  async function confirm(password: string) {
    setStatus("submitting");
    setError(null);

    try {
      await deleteAccount(password);
      await logout();
      window.location.href = "/";
    } catch (err: any) {
      setStatus("error");
      const body = err?.data as { error?: string } | null;
      setError(body?.error || "Account löschen fehlgeschlagen.");
    }
  }

  return { status, error, requestDelete, cancel, confirm };
}