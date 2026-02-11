import * as React from "react";
import clsx from "clsx";
import { Slot } from "@radix-ui/react-slot";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "heroCta" | "next" | "previous";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
};

const base =
    "inline-flex items-center justify-center gap-[0.6rem] " +
    "rounded-[calc(var(--radius-sm)-2px)] " +
    "font-semibold tracking-[-0.01em] " +
    "border border-transparent " +
    "[transition:transform_var(--transition-fade),box-shadow_var(--transition-fade),background_var(--transition-fade),color_var(--transition-fade)] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "active:translate-y-0 " +
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] " +
    "focus-visible:outline-[color-mix(in_srgb,var(--color-accent)_55%,transparent)]";

const sizes: Record<ButtonSize, string> = {
    sm: "px-[0.9rem] py-[0.6rem] text-[0.9rem]",
    md: "px-[1.2rem] py-[0.95rem] text-[1rem]",
    lg: "px-[1.4rem] py-[1.05rem] text-[1.05rem]",
    // icon: quadratisch, ohne padding “leaks”
    icon: "h-10 w-10 p-0",
};

const primaryLike =
    "bg-[var(--color-accent)] text-white " +
    "border-[color-mix(in_srgb,var(--color-accent-strong)_35%,transparent)] " +
    "shadow-[var(--shadow-xs)] " +
    "enabled:hover:bg-[var(--color-accent-strong)]";

const variants: Record<ButtonVariant, string> = {
    primary: primaryLike + " enabled:hover:-translate-y-[2px]",

    secondary:
        "bg-[var(--color-surface)] text-[var(--color-accent-strong)] " +
        "border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] " +
        "enabled:hover:bg-[var(--color-accent-soft)] enabled:hover:text-[var(--color-accent-strong)]",

    outline:
        "bg-transparent text-[var(--color-foreground)] " +
        "border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] " +
        "enabled:hover:bg-[var(--color-surface)]",

    ghost:
        "bg-transparent text-[var(--color-foreground)] border-transparent shadow-none " +
        "enabled:hover:bg-[color-mix(in_srgb,var(--color-accent-soft)_70%,transparent)] " +
        "enabled:hover:text-[var(--color-accent-strong)]",

    heroCta:
        "relative overflow-hidden " +
        "bg-[var(--hero-cta-bg)] !text-[var(--hero-cta-fg)] " +
        "border border-[var(--hero-cta-border)] " +
        "shadow-[0_18px_55px_-28px_rgba(0,0,0,0.45)] " +
        "supports-[backdrop-filter]:backdrop-blur-xl " +
        "[-webkit-backdrop-filter:blur(18px)] [backdrop-filter:blur(18px)] " +
        // sichtbarer Glas-Glanz
        "before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] " +
        "before:pointer-events-none before:opacity-90 " +
        "before:bg-[linear-gradient(to_bottom,var(--hero-cta-gloss),rgba(255,255,255,0.06)_55%,transparent)] " +
        // Innenkante für “Glas”
        "after:content-[''] after:absolute after:inset-[1px] after:rounded-[calc(var(--btn-radius)-2px)] " +
        "after:pointer-events-none after:border after:border-[var(--hero-cta-inner)] after:opacity-80 " +
        "enabled:hover:bg-[var(--hero-cta-bg-hover)] " +
        "enabled:hover:border-[var(--hero-cta-border-hover)] " +
        "focus-visible:outline-[var(--hero-cta-focus)]",

    // behält dein Verhalten
    next: primaryLike + " enabled:hover:-translate-y-[1px]",
    previous: primaryLike + " enabled:hover:-translate-y-[1px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", asChild = false, type, ...props }, ref) => {
        const resolvedType = type ?? "button";
        const Comp: any = asChild ? Slot : "button";

        return (
            <Comp
                ref={ref}
                type={asChild ? undefined : resolvedType}
                className={clsx(base, sizes[size], variants[variant], className)}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
