"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./MobileSidebar.module.css";

type Variant = "primary" | "secondary";

interface SidebarNavLinkProps {
    href: string;
    active: boolean;
    onClick: () => void;
    tabIndex: number;
    variant?: Variant;
    children: ReactNode;
}

export default function SidebarNavLink({
    href,
    active,
    onClick,
    tabIndex,
    variant = "primary",
    children,
}: SidebarNavLinkProps) {
    const secondaryClass = variant === "secondary" ? styles["item--secondary"] : "";

    return (
        <Link
            href={href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={`${styles.item} ${secondaryClass} ${active ? styles.active : ""}`}
            tabIndex={tabIndex}
        >
            {children}
        </Link>
    );
}
