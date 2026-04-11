"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/typography/Heading";
import { Text } from "@/components/typography/Text";
import { Container } from "@/components/layout/Container";

type Props = {
  status: "idle" | "submitting" | "success" | "error";
  error: string | null;
  onSubmit: (password: string, confirmPassword: string) => void;
  onNavigateToLogin: () => void;
};

export default function ResetPassword({ status, error, onSubmit, onNavigateToLogin }: Props) {
  const t = useTranslations("pages.auth.verification.resetPassword");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (status === "success") {
    return (
      <Container>
        <div className="mx-auto flex min-h-[calc(100vh-var(--header-h)-8rem)] max-w-md items-center justify-center px-4 py-12">
          <Card className="w-full p-8 text-center">
            <Heading as="h1" className="mt-0">{t("success.title")}</Heading>
            <Text size="base" tone="muted" className="mt-2">{t("success.description")}</Text>
            <Button className="mt-6" variant="primary" onClick={onNavigateToLogin}>
              {t("success.cta")}
            </Button>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mx-auto flex min-h-[calc(100vh-var(--header-h)-8rem)] max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full p-8">
          <Heading as="h1" className="mt-0">{t("title")}</Heading>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(password, confirmPassword);
            }}
            className="mt-6 grid gap-4"
          >
            <div>
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <Text size="sm" className="mt-0 text-red-600">{error}</Text>
            )}

            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? t("submitting") : t("cta")}
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}