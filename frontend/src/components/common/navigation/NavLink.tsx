"use client";

import Link from "next/link";
import clsx from "clsx";

interface NavLinkProps {
    href: string;
    active: boolean;
    children: React.ReactNode;
    className?: string;
    activeClassName?: string;
    inactiveClassName?: string;
    onClick?: () => void;
    tabIndex?: number;
}

export default function NavLink({
    href,
    active,
    children,
    className,
    activeClassName,
    inactiveClassName,
    onClick,
    tabIndex,
}: NavLinkProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            tabIndex={tabIndex}
            aria-current={active ? "page" : undefined}
            className={clsx(className, active ? activeClassName : inactiveClassName)}
        >
            {children}
        </Link>
    );
}
