// MobileMenuButton.tsx
"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import styles from "./HeaderNav.module.css";

interface MobileMenuButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

export function MobileMenuButton({ onClick, isOpen }: MobileMenuButtonProps) {
    const tNav = useTranslations("common.navigation");

    return (
        <div className="flex flex-shrink-0 items-center lg:hidden">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClick}
                className={styles.menuButton}
                aria-label={tNav("menu.open")}
                aria-expanded={isOpen}
                aria-controls="mobile-sidebar"
            >
                <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                >
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
            </Button>
        </div>
    );
}