"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { resendVerificationEmail } from "@/services/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/typography/Text";

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const t = useTranslations("pages.auth.verification.verifyEmail.banner");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!user || user.emailVerified) return null;

  async function handleResend() {
    setStatus("sending");
    try {
      await resendVerificationEmail();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card variant="orientation" gap="sm" className="rounded-none border-x-0 border-t-0 p-3 hover:translate-y-0 hover:shadow-none">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {status === "sent" ? (
          <Text size="sm" className="mt-0">{t("sent")}</Text>
        ) : (
          <>
            <Text size="sm" className="mt-0">{t("message")}</Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={status === "sending"}
            >
              {status === "sending" ? t("sending") : t("resend")}
            </Button>
            {status === "error" && (
              <Text size="sm" className="mt-0 text-red-600">{t("error")}</Text>
            )}
          </>
        )}
      </div>
    </Card>
  );
}