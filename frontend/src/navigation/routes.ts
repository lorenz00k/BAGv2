export const ROUTES = {
    home: '',

    faq: '/faq',
    imprint: '/imprint',
    privacy: '/privacy',


    //different checks
    checks: '/checks',
    complianceChecker: '/checks/compliance-checker',
    addressChecker: '/checks/address-checker',
    fundingChecker: '/checks/funding-checker',

    //different documents
    documents: '/documents',
    requiredDocuments: '/documents/required-documents',
    documentAssistant: '/documents/document-assistant'


} as const

export type RouteKey = keyof typeof ROUTES