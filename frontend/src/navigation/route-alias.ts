//rewrite url kebab case to camel case

export const KEBAB_TO_CAMEL: Record<string, string> = {
    "checks/compliance-checker": "checks/complianceChecker",
    "checks/address-checker": "checks/addressChecker",
    "checks/funding-checker": "checks/fundingChecker",
    "checks/compliance-checker/result": "checks/complianceChecker/result",
    "documents/required-documents": "documents/requiredDocuments",
    "documents/document-assistant": "documents/documentAssistant",
    "verify-email": "verifyEmail",
    "forgot-password": "forgotPassword",
    "reset-password": "resetPassword"
}

export const CAMEL_TO_KEBAB: Record<string, string> = Object.fromEntries(
    Object.entries(KEBAB_TO_CAMEL).map(([kebab, camel]) => [camel, kebab])
)