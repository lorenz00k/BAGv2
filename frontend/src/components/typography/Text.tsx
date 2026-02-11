// src/components/typography/Text.tsx
import * as React from "react";
import clsx from "clsx";

export type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
    tone?: "default" | "muted";
    size?: "sm" | "base";
};

const toneClasses: Record<NonNullable<TextProps["tone"]>, string> = {
    default: "text-slate-700",
    muted: "text-slate-600",
};

const sizeClasses: Record<NonNullable<TextProps["size"]>, string> = {
    sm: "text-[14px] leading-6",
    base: "text-[15px] leading-7",
};

export function Text({
    className,
    tone = "default",
    size = "base",
    ...props
}: TextProps) {
    return (
        <p
            className={clsx("mt-3", sizeClasses[size], toneClasses[tone], className)}
            {...props}
        />
    );
}
