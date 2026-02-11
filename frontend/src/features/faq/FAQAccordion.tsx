"use client";

import React from "react";
import styles from "./FAQAccordion.module.css";
import { Button } from "@/components/ui/Button";

export type FAQItem = {
    id: string;
    question: string;
    answer: string;
};

type FAQAccordionProps = {
    items: FAQItem[];
    openId: string | null;
    onToggle: (id: string) => void;
};

export default function FAQAccordion({ items, openId, onToggle }: FAQAccordionProps) {
    return (
        <div className={styles.accordion}>
            {items.map((it) => {
                const isOpen = openId === it.id;
                return (
                    <div key={it.id} className={styles.item}>
                        <Button
                            className={styles.trigger}
                            onClick={() => onToggle(it.id)}
                            aria-expanded={isOpen}
                            aria-controls={`answer-${it.id}`}
                            id={`question-${it.id}`}
                        >
                            <span className={styles.question}>{it.question}</span>

                            <svg
                                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </Button>

                        <div
                            id={`answer-${it.id}`}
                            role="region"
                            aria-labelledby={`question-${it.id}`}
                            className={`${styles.collapse} ${isOpen ? styles.expand : ""}`}
                        >
                            <div className={styles.panel}>{it.answer}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
