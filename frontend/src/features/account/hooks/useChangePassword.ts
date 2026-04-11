"use client";

import { useState } from "react";
import { changePassword } from "@/services/account";

export function useChangePassword() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(currentPassword: string, newPassword: string, confirmPassword: string) {
    setError(null);

    if (newPassword.length < 8) {
      setError("Neues Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setStatus("submitting");
    try {
      await changePassword(currentPassword, newPassword);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      const body = err?.data as { error?: string } | null;
      setError(body?.error || "Passwort ändern fehlgeschlagen.");
    }
  }

  const reset = () => {
    setStatus("idle");
    setError(null);
  };

  return { status, error, submit, reset };
}