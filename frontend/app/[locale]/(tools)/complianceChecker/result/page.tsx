import type { Locale } from "@/i18n/locales";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import ResultPage from "@/tools/complianceChecker/result/ResultPage";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.complianceResult",
  });

  return {
    title: t("title"),
  };
}

export default async function ComplianceResultPage({ params }: PageProps) {
  await params;

  return <ResultPage />;
}
