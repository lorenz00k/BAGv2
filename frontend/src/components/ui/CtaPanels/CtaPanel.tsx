"use client";

import Link from "next/link";
import { BreakText } from "@/components/common/BreakText";
import { ArrowRight } from "lucide-react";
import styles from "./CtaPanel.module.css";
import { Button } from "@/components/ui/Button";

type CtaPanelProps = {
    title: string;
    text: string;
    href: string;
    buttonLabel: string;
    ariaLabel?: string;
};

export default function CtaPanel({
    title,
    text,
    href,
    buttonLabel,
    ariaLabel,
}: CtaPanelProps) {
    return (
        <div className={styles.panel} aria-label={ariaLabel}>
            <h3 className={styles.title}>
                <BreakText className="block">{title}</BreakText>
            </h3>

            <div className={styles.text}>
                <BreakText className="block">{text}</BreakText>
            </div>

            <Button asChild variant="primary">
                <Link href={href}>
                    <BreakText>{buttonLabel}</BreakText>
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </Button>
        </div>
    );
}
