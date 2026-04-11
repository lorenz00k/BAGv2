"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/typography/Heading";
import { Text } from "@/components/typography/Text";
import { Container } from "@/components/layout/Container";
import { useTranslations } from "next-intl";

type Props = {
  status: "loading" | "success" | "error";
  onNavigateHome: () => void;
};

export default function VerifyEmail({ status, onNavigateHome }: Props) {
  const t = useTranslations("pages.auth.verification.verifyEmail");

  return (
    <Container>
      <div className="mx-auto flex min-h-[calc(100vh-var(--header-h)-8rem)] max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full p-8 text-center">
          {status === "loading" && (
            <Text size="base" tone="muted">{t("loading")}</Text>
          )}

          {status === "success" && (
            <>
              <Heading as="h1" className="mt-0">{t("success.title")}</Heading>
              <Text size="base" tone="muted" className="mt-2">
                {t("success.description")}
              </Text>
              <Button className="mt-6" variant="primary" onClick={onNavigateHome}>
                {t("success.cta")}
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <Heading as="h1" className="mt-0">{t("error.title")}</Heading>
              <Text size="base" tone="muted" className="mt-2">
                {t("error.description")}
              </Text>
              <Button className="mt-6" variant="secondary" onClick={onNavigateHome}>
                {t("error.cta")}
              </Button>
            </>
          )}
        </Card>
      </div>
    </Container>
  );
}