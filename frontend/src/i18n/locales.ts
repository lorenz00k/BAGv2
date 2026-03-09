//locales, defaultLocale, locale type

export const locales = ['de', 'en', 'sr', 'hr', 'tr', 'it', 'es', 'uk'] as const
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";

export const languageMeta: Record<Locale, { name: string; flag: string }> = {
    de: { name: 'Deutsch', flag: '🇩🇪' },
    en: { name: 'English', flag: '🇬🇧' },
    sr: { name: 'Српски', flag: '🇷🇸' },
    hr: { name: 'Hrvatski', flag: '🇭🇷' },
    tr: { name: 'Türkçe', flag: '🇹🇷' },
    it: { name: 'Italiano', flag: '🇮🇹' },
    es: { name: 'Español', flag: '🇪🇸' },
    uk: { name: 'Українська', flag: '🇺🇦' },
}

export function isLocale(value: string | undefined | null): value is Locale {
    return !!value && (locales as readonly string[]).includes(value);
}