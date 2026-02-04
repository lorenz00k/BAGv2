'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { defaultLocale, locales, languageMeta, type Locale } from '@/i18n/locales'

function isLocale(value: string): value is Locale {
    return (locales as readonly string[]).includes(value)
}

function replaceLocaleInPath(pathname: string, nextLocale: Locale) {
    const re = new RegExp(`^/(${locales.join('|')})(?=/|$)`)
    if (re.test(pathname)) return pathname.replace(re, `/${nextLocale}`)
    if (pathname === '/' || pathname === '') return `/${nextLocale}`
    return `/${nextLocale}${pathname.startsWith('/') ? '' : '/'}${pathname}`
}

interface LanguageSwitcherProps {
    direction?: 'up' | 'down'
}

export default function LanguageSwitcher({ direction = 'down' }: LanguageSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = useParams<{ locale?: string | string[] }>()
    const t = useTranslations('nav')

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const locale: Locale = useMemo(() => {
        const raw = params?.locale
        const value = Array.isArray(raw) ? raw[0] : raw
        return value && isLocale(value) ? value : defaultLocale
    }, [params])

    const current = languageMeta[locale]

    useEffect(() => {
        const onDown = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [])

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [])

    const handleLanguageChange = (next: Locale) => {
        const base = replaceLocaleInPath(pathname, next)
        const qs = searchParams?.toString()
        const hash = typeof window !== 'undefined' ? window.location.hash : ''
        router.push(`${base}${qs ? `?${qs}` : ''}${hash}`)
        setIsOpen(false)
    }

    const dropdownPositionClasses =
        direction === 'up' ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'

    return (
        <div className="relative inline-flex" ref={dropdownRef}>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen((p) => !p)}
                className={`h-8 gap-1.5 rounded-full bg-white/80 px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-white ${isOpen ? 'ring-2 ring-slate-400' : ''
                    }`}
                aria-label={t('selectLanguage')}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="text-base" aria-hidden>
                    {current.flag}
                </span>
                <span className="hidden text-sm font-semibold text-slate-900 sm:inline">{current.name}</span>
                <svg
                    className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                </svg>
            </Button>

            {isOpen && (
                <div
                    className={`absolute right-0 z-50 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5 ${dropdownPositionClasses}`}
                    role="listbox"
                >
                    {locales.map((code) => {
                        const meta = languageMeta[code]
                        const isSelected = code === locale

                        return (
                            <Button
                                key={code}
                                type="button"
                                variant="ghost"
                                onClick={() => handleLanguageChange(code)}
                                role="option"
                                aria-selected={isSelected}
                                className={`h-auto w-full justify-between rounded-lg px-2 py-1.5 text-sm ${isSelected ? 'bg-slate-100 font-semibold text-slate-900 hover:bg-slate-100' : 'text-slate-700'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-base" aria-hidden>
                                        {meta.flag}
                                    </span>
                                    <span>{meta.name}</span>
                                </span>

                                {isSelected && (
                                    <svg className="h-4 w-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </Button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
