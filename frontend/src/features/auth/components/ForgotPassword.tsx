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
  status: "idle" | "sending" | "sent" | "error";
  onSubmit: (email: string) => void;
};

export default function ForgotPassword({ status, onSubmit }: Props) {
  const t = useTranslations("pages.auth.verification.forgotPassword");
  const [email, setEmail] = useState("");

  if (status === "sent") {
    return (
      <Container>
        <div className="mx-auto flex min-h-[calc(100vh-var(--header-h)-8rem)] max-w-md items-center justify-center px-4 py-12">
          <Card className="w-full p-8 text-center">
            <Heading as="h1" className="mt-0">{t("sent.title")}</Heading>
            <Text size="base" tone="muted" className="mt-2">{t("sent.description")}</Text>
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
          <Text size="base" tone="muted" className="mt-2">{t("description")}</Text>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(email);
            }}
            className="mt-6 grid gap-4"
          >
            <div>
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {status === "error" && (
              <Text size="sm" className="mt-0 text-red-600">{t("error")}</Text>
            )}

            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? t("sending") : t("cta")}
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}