import BreakPoint from "@/components/common/BreakPoint";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import SectionHeading from "@/components/layout/SectionHeading";
import StackedCards from "@/components/ui/StackedCards/StackedCards";
import { useTranslations } from "next-intl";


export default function FounderGuide() {
    const t = useTranslations("sections.founderGuide");
    return (
        <Section>
            <Container>
                <SectionHeading
                    id="founder-guide-title"
                    title={t("heading")}
                    subtitle={t("intro")}
                    as="h2"
                    subtitleAs="p" />
                <BreakPoint />
                <StackedCards
                    items={[
                        { title: t("items.0.question"), body: t("items.0.answer") },
                        { title: t("items.1.question"), body: t("items.1.answer") },
                        { title: t("items.2.question"), body: t("items.2.answer") },
                    ]}
                />
            </Container>
        </Section>

    )
}