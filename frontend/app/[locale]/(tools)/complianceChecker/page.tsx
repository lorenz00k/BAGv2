import type { Locale } from "@/i18n/locales";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import ComplianceWizard from "@/tools/complianceChecker/ComplianceWizard";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.complianceChecker",
  });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ComplianceCheckerPage({ params }: PageProps) {
  await params;

  return <ComplianceWizard />;
}
