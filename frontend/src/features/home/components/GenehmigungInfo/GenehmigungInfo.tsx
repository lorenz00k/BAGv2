import { useTranslations } from "next-intl"
import { AlertTriangle, Shield, Volume2, Building2, Car, Droplets } from "lucide-react"
import { Section } from "@/components/layout/Section"
import { Container } from "@/components/layout/Container"
import SectionHeading from "@/components/layout/SectionHeading/SectionHeading"
import { Card, CardIcon, CardTitle, CardBody } from "@/components/ui/Card"
import { AutoGrid } from "@/components/common/AutoGrid"
import { Text } from "@/components/typography/Text"
import BreakPoint from "@/components/common/BreakPoint"

// Icons und Tones für die 5 Genehmigungsgründe
const REASON_META = [
    { Icon: Shield,    tone: "shield"     },
    { Icon: Volume2,   tone: "warm"       },
    { Icon: Building2, tone: "default"    },
    { Icon: Car,       tone: "accentSoft" },
    { Icon: Droplets,  tone: "success"    },
] as const

export default function GenehmigungInfo() {
    const t = useTranslations("sections.genehmigungInfo")

    return (
        <Section>
            <Container>
                <SectionHeading
                    id="genehmigung-info-title"
                    title={t("heading")}
                    subtitle={t("subtitle")}
                    as="h2"
                    subtitleAs="p"
                />

                <Text>{t("intro")}</Text>

                <BreakPoint />

                {/* Warning callout */}
                <div className="rounded-[var(--radius)] border border-[color-mix(in_srgb,#f59e0b_40%,transparent)] bg-[color-mix(in_srgb,#f59e0b_8%,var(--color-surface))] p-5 flex gap-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden />
                    <div className="text-base leading-7 text-slate-700">
                        <strong>{t("warningTitle")}: </strong>
                        {t("warningText")}
                    </div>
                </div>

                <BreakPoint />

                <SectionHeading
                    title={t("whenTitle")}
                    subtitle={t("whenIntro")}
                    as="h3"
                    subtitleAs="p"
                />

                <BreakPoint size="sm" />

                <AutoGrid min="14rem" gap="1rem">
                    {REASON_META.map(({ Icon, tone }, idx) => (
                        <Card key={idx} variant="subtle">
                            <CardIcon tone={tone}>
                                <Icon className="w-6 h-6" aria-hidden strokeWidth={2} />
                            </CardIcon>
                            <CardTitle>
                                {t(`reasons.${idx}.title`)}
                            </CardTitle>
                            <CardBody>
                                {t(`reasons.${idx}.text`)}
                            </CardBody>
                        </Card>
                    ))}
                </AutoGrid>
            </Container>
        </Section>
    )
}
