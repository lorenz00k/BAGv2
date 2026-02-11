import { BreakText } from "@/components/common/BreakText";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

import styles from "./DocumentTeaser.module.css";
import { useTranslations } from "next-intl";
import { href } from "@/navigation/nav";
import { Locale } from "@/i18n/locales";
import BreakPoint from "@/components/common/BreakPoint";

export default function DocumentTeaser({ locale }: { locale: string }) {
    const t = useTranslations("components.featureCards");

    return (
        <Section>
            <Container>
                <div className={styles.documentTeaser}>
                    <div className={styles.content}>
                        <h2 id="documents-teaser-title" className={styles.title}>
                            <BreakText className="block">{t("cards.1.title")}</BreakText>
                        </h2>
                        <BreakPoint />
                        <BreakText className={`${styles.description} block`}>
                            {t("cards.1.description")}
                        </BreakText>
                        <BreakPoint />
                        <Button asChild variant="primary">
                            <Link href={href(locale as Locale, "documents")}>{t("cards.1.cta")}</Link>
                        </Button>
                    </div>

                    <div className={styles.media} aria-hidden>
                        <div className={styles.mediaFrame}>
                            <Image
                                src="/assets/images/home/feature-2.jpg"
                                alt=""
                                fill
                                className={styles.image}
                                sizes="(max-width: 900px) 100vw, 700px"
                                priority={false}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    )
}