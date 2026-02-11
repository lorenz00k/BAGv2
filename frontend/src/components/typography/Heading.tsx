import * as React from "react";
import clsx from "clsx";

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5";
    tone?: "default" | "muted";
};

const toneClasses: Record<NonNullable<HeadingProps["tone"]>, string> = {
    default: "text-slate-900",
    muted: "text-slate-700",
};

const levelClasses: Record<NonNullable<HeadingProps["as"]>, string> = {
    h1: "mt-12 text-4xl font-semibold tracking-[-0.02em]",
    h2: "mt-10 text-2xl font-semibold tracking-[-0.015em]",
    h3: "mt-6 text-lg font-semibold tracking-[-0.01em]",
    h4: "mt-5 text-base font-semibold tracking-[-0.005em]",
    h5: "mt-4 text-base font-semibold tracking-[-0.00125em]",
};

export function Heading({
    as = "h2",
    tone = "default",
    className,
    ...props
}: HeadingProps) {
    const Tag = as;
    return (
        <Tag
            className={clsx(levelClasses[as], toneClasses[tone], className)}
            {...props}
        />
    );
}
