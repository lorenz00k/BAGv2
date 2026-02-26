
import { Zap, Languages, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

import SectionHeading from "@/components/layout/SectionHeading/SectionHeading";
import { AutoGrid } from "@/components/common/AutoGrid";
import { BreakText } from "@/components/common/BreakText";
import styles from "./SellingPoints.module.css";
import { Card, CardBody, CardIcon, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default function SellingPoints() {
    const t = useTranslations("sections.approvalSeo");

    const items = [
        {
            key: "feature1",
            Icon: Zap,
            tone: "accentSoft",
            title: t("features.0.title"),
            body: t("features.0.text", { value: 3 }),
        },
        {
            key: "feature2",
            Icon: Languages,
            tone: "success",
            title: t("features.1.title"),
            body: t("features.1.text", { value: 8 }),
        },
        {
            key: "feature3",
            Icon: Shield,
            tone: "shield",
            title: t("features.2.title"),
            body: t("features.2.text"),
        },
    ] as const;

    return (
        <Section aria-labelledby="selling-points-title">
            <Container>
                <SectionHeading
                    id="selling-points-title"
                    title={t("heading")}
                    subtitle={t("intro")}
                    as="h2"          // optional, ist eh default
                    subtitleAs="p"   // optional, ist eh default
                />
                <div className={styles.grid}>
                    <AutoGrid min="14rem">
                        {items.map(({ key, Icon, tone, title, body }) => (
                            <Card key={key} variant="subtle">
                                <CardIcon tone={tone}>
                                    <Icon aria-hidden className="w-6 h-6" strokeWidth={2} />
                                </CardIcon>

                                <CardTitle>
                                    <BreakText className="block">{title}</BreakText>
                                </CardTitle>

                                <CardBody>
                                    <BreakText className="block">{body}</BreakText>
                                </CardBody>
                            </Card>
                        ))}
                    </AutoGrid>
                </div>
            </Container>
        </Section>
    );
}
