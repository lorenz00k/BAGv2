import type { Locale } from "@/i18n/locales";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import AddressChecker from "@/tools/addressChecker/addressChecker";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.addressChecker" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AddressCheckerPage({ params }: PageProps) {
  // Await params to validate locale — translations are loaded via
  // NextIntlClientProvider in the parent layout.
  await params;

  return <AddressChecker />;
}
