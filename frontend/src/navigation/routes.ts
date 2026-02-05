export const ROUTES = {
    home: '',
    complianceChecker: '/compliance-checker',
    addressChecker: '/address-checker',
    gastroAi: '/gastro-ai',
    faq: '/faq',
    imprint: '/imprint',
    privacy: '/privacy',
} as const

export type RouteKey = keyof typeof ROUTES