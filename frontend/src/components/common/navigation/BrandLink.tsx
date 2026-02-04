"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import clsx from "clsx";

interface BrandLinkProps {
    locale: Locale;
    onClick?: () => void;
    className?: string;
    showText?: boolean;
    text?: string; // falls du nicht via translations reinreichen willst
}

export default function BrandLink({
    locale,
    onClick,
    className,
    showText = true,
    text = "BAC",
}: BrandLinkProps) {
    return (
        <Link
            href={`/${locale}`}
            onClick={onClick}
            className={clsx("flex items-center gap-2 min-w-0", className)}
        >
            <Image
                src="/icon.svg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg shadow-sm"
            />
            {showText && (
                <span className="ml-2 truncate text-sm font-semibold text-current">
                    {text}
                </span>
            )}
        </Link>
    );
}
