"use client";

import { useEffect, useRef } from "react";

const focusableSelectors = [
    'a[href]',
    "button:not([disabled])",
    "textarea",
    'input[type="text"]',
    'input[type="radio"]',
    'input[type="checkbox"]',
    "select",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

interface UseFocusTrapArgs {
    active: boolean;
    containerRef: React.RefObject<HTMLElement | null>;
    onEscape: () => void;
}

/**
 * Focus trap + Escape handling.
 * - Stores last focused element and restores it on cleanup
 * - Focuses the first focusable element when activated
 */
export function useFocusTrap({ active, containerRef, onEscape }: UseFocusTrapArgs) {
    const lastFocusedElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!active) return;

        lastFocusedElement.current = document.activeElement as HTMLElement;

        const container = containerRef.current;
        const focusable = container
            ? Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
            : [];

        focusable[0]?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onEscape();
                return;
            }

            if (event.key !== "Tab" || focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const activeEl = document.activeElement as HTMLElement | null;

            if (!event.shiftKey && activeEl === last) {
                event.preventDefault();
                first.focus();
            } else if (event.shiftKey && activeEl === first) {
                event.preventDefault();
                last.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            lastFocusedElement.current?.focus();
        };
    }, [active, containerRef, onEscape]);
}
