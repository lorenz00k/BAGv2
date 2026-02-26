"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/Button"

import styles from "./Hero.module.css"
import { BreakText } from "@/components/common/BreakText"
import { href } from "@/navigation/nav"
import { Locale } from "@/i18n/locales"


export default function Hero({ locale }: { locale: string }) {
    const t = useTranslations("pages.home")
    const tStats = useTranslations("components.stats")
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [useImageFallback, setUseImageFallback] = useState(false)

    const items = tStats.raw("items") as Array<{ valueTemplate: string; label: string }>

    const values = [8, 3, undefined]

    const stats = useMemo(
        () =>
            items.map((item, i) => ({
                value:
                    values[i] === undefined
                        ? item.valueTemplate
                        : item.valueTemplate.replace("{value}", String(values[i])),
                label: item.label,
            })),
        [items] // values ist konstant in dem Beispiel
    )

    useEffect(() => {
        const v = videoRef.current
        if (!v) return

        let settled = false
        const markFallback = () => {
            if (!settled) {
                settled = true
                setUseImageFallback(true)
            }
        }
        const markPlaying = () => {
            if (!settled) {
                settled = true
                setUseImageFallback(false)
            }
        }

        const onCanPlay = () => {
            v.play().then(markPlaying).catch(markFallback)
        }

        v.addEventListener("playing", markPlaying)
        v.addEventListener("canplay", onCanPlay)
        v.addEventListener("error", markFallback)
        v.addEventListener("stalled", markFallback)
        v.addEventListener("abort", markFallback)

        // try immediately
        v.play().then(markPlaying).catch(() => {
            /* fallback via timer below */
        })

        const timer = window.setTimeout(() => {
            if (v.paused || v.readyState < 3) markFallback()
        }, 1200)

        return () => {
            window.clearTimeout(timer)
            v.removeEventListener("playing", markPlaying)
            v.removeEventListener("canplay", onCanPlay)
            v.removeEventListener("error", markFallback)
            v.removeEventListener("stalled", markFallback)
            v.removeEventListener("abort", markFallback)
        }
    }, [])

    return (
        <section className={`${styles.hero} section`}>
            <div className={styles.bg} aria-hidden="true">
                {/* Video (only visible if it actually plays) */}
                <video
                    ref={videoRef}
                    className={`${styles.video} ${useImageFallback ? styles.hidden : ""}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    poster="/assets/images/home/verkaufer-bild.jpg"
                >
                    <source src="/assets/images/home/hero-video.mp4" type="video/mp4" />
                </video>

                {/* Image fallback */}
                <div className={`${styles.posterWrap} ${useImageFallback ? styles.visible : ""}`}>
                    <Image
                        src="/assets/images/home/verkaufer-bild.jpg"
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className={styles.poster}
                    />
                </div>
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>
                    <BreakText className="block">{t("title")}</BreakText>
                </h1>

                <BreakText className={styles.copy}>{t("subtitle", { value: 3 })}</BreakText>

                <div className={styles.stats} aria-label="Key stats">
                    {stats.map((s) => (
                        <div className={styles.stat} key={`${s.label}-${s.value}`}>
                            <div className={styles.statValue}>{s.value}</div>
                            <div className={styles.statLabel}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <Button variant="heroCta" asChild className={styles.cta}>
                    <Link href={href(locale as Locale, "complianceChecker")}>{t("cta")}</Link>
                </Button>
            </div>
        </section>
    )
}
