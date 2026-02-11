import * as React from "react";
import clsx from "clsx";

type CardVariant = "default" | "subtle";
type IconTone = "default" | "warm" | "accentSoft" | "success" | "shield";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: CardVariant;
};

const cardBase =
    "bg-[var(--color-surface)] rounded-[var(--radius)] " +
    "border border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] " +
    "shadow-[var(--shadow-xs)] " +
    "p-[clamp(2rem,4vw,2.75rem)] " +
    "grid gap-6 " + // 1.5rem
    "[transition:transform_var(--transition-move),box-shadow_var(--transition-move),border-color_var(--transition-fade)] " +
    "hover:-translate-y-[6px] hover:shadow-[var(--shadow-sm)] " +
    "hover:border-[color-mix(in_srgb,var(--color-accent)_20%,var(--color-border))]";

const cardSubtle =
    "shadow-none border-[color-mix(in_srgb,var(--color-border)_60%,transparent)] " +
    "hover:shadow-[var(--shadow-xs)]";

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(cardBase, variant === "subtle" && cardSubtle, className)}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";

export type CardIconProps = React.HTMLAttributes<HTMLDivElement> & {
    tone?: IconTone;
};

const iconBase =
    "w-14 h-14 rounded-[var(--radius-sm)] grid place-items-center " +
    "bg-[var(--card-icon-bg)] text-[var(--card-icon-fg)] shadow-[var(--shadow-xs)]";

const iconTones: Record<IconTone, string> = {
    default: "",
    warm: "bg-[var(--card-icon-warm-bg)] text-[var(--card-icon-warm-fg)]",
    accentSoft: "bg-[var(--card-icon-accentSoft-bg)] text-[var(--card-icon-accentSoft-fg)]",
    success: "bg-[var(--card-icon-success-bg)] text-[var(--card-icon-success-fg)]",
    shield: "bg-[var(--card-icon-shield-bg)] text-[var(--card-icon-shield-fg)]",
};

export const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
    ({ className, tone = "default", ...props }, ref) => {
        return (
            <div ref={ref} className={clsx(iconBase, iconTones[tone], className)} {...props} />
        );
    }
);
CardIcon.displayName = "CardIcon";

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={clsx("m-0 text-[clamp(1.4rem,2.4vw,1.75rem)]", className)}
                {...props}
            />
        );
    }
);
CardTitle.displayName = "CardTitle";

export type CardBodyProps = React.HTMLAttributes<HTMLParagraphElement>;

export const CardBody = React.forwardRef<HTMLParagraphElement, CardBodyProps>(
    ({ className, ...props }, ref) => {
        return <p ref={ref} className={clsx("m-0 text-[var(--color-fg-subtle)]", className)} {...props} />;
    }
);
CardBody.displayName = "CardBody";
