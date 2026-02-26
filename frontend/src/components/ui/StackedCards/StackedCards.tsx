"use client";

import React from "react";
import styles from "./StackedCards.module.css";
import { BreakText } from "@/components/common/BreakText";
import BreakPoint from "@/components/common/BreakPoint";

type Item = {
    title: string;
    body?: string;
    bodyNode?: React.ReactNode;
};

function cssVar(name: `--${string}`, value: string | number): React.CSSProperties {
    return { [name]: value } as React.CSSProperties;
}

export default function StackedCards({
    items,
    headingLevel = 3,
}: {
    items: Item[];
    headingLevel?: 2 | 3 | 4;
}) {
    const HeadingTag = (`h${headingLevel}` as unknown) as React.ElementType;

    return (
        <div className={styles.cards} style={cssVar("--numcards", items.length)}>
            {items.map((item, idx) => (
                <article
                    key={idx}
                    className={styles.card}
                    style={cssVar("--index", idx + 1)}
                >
                    <div className={styles.card__content}>
                        <HeadingTag className={styles.card__title}>
                            <BreakText className="block">{item.title}</BreakText>
                        </HeadingTag>

                        <BreakPoint />

                        <div className={styles.card__body}>
                            {item.bodyNode ? (
                                item.bodyNode
                            ) : item.body ? (
                                <BreakText className="block">{item.body}</BreakText>
                            ) : null}
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
