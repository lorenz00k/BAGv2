import ComplianceCheckerWizard from "@/features/complianceChecker/ui/ComplianceCheckerWizard";
import { Locale, locales } from "@/i18n/locales";
import { notFound } from "next/navigation";

export default async function ComplianceCheckerPage(){

  return <ComplianceCheckerWizard />;
}