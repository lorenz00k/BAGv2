"use client";

import { useState } from "react";
import { forgotPassword } from "@/services/auth";

export function useForgotPassword() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(email: string) {
    setStatus("sending");
    try {
      await forgotPassword(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return { status, submit };
}