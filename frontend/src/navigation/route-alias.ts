//rewrite url kebab case to camel case

export const KEBAB_TO_CAMEL: Record<string, string> = {
    "compliance-checker": "complianceChecker",
    "address-checker": "addressChecker",
    "gastro-ai": "gastroAi",
}

export const CAMEL_TO_KEBAB: Record<string, string> = Object.fromEntries(
    Object.entries(KEBAB_TO_CAMEL).map(([kebab, camel]) => [camel, kebab])
)