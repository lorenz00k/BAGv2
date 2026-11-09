import { BreakText } from "@/components/common/BreakText";
import styles from "./SectionHeading.module.css";
import type { ElementType } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4";

type SectionHeadingProps = {
    id?: string;
    title: string;
    subtitle?: string;
    as?: HeadingTag;          // default: h2
    subtitleAs?: "p" | "h3" | "h4"; // default: p oder h3 (ich würde p nehmen)
};

export default function SectionHeading({
    id,
    title,
    subtitle,
    as = "h2",
    subtitleAs = "p",
}: SectionHeadingProps) {
    const TitleTag: ElementType = as;
    const SubTag: ElementType = subtitleAs;

    return (
        <div className={styles.heading}>
            <TitleTag id={id} className={styles.title}>
                <BreakText className="block">{title}</BreakText>
            </TitleTag>

            {subtitle && (
                <SubTag className={styles.subtitle}>
                    <BreakText className="block">{subtitle}</BreakText>
                </SubTag>
            )}
        </div>
    );
}
