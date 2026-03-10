import * as React from "react";
import clsx from "clsx";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    withIcon?: boolean;
    withUnit?: boolean;
};

const base =
    "w-full bg-[var(--color-surface)] text-[var(--color-fg)] text-[1rem] " +
    "border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] " +
    "rounded-[var(--radius-xs)] " +
    "py-[var(--form-padding-block)] pl-[var(--form-padding-inline-start)] pr-[var(--form-padding-inline-end)] " +
    "[transition:border-color_var(--transition-fade),box-shadow_var(--transition-fade),background_var(--transition-fade)] " +
    "focus-visible:outline-none " +
    "focus-visible:border-[color-mix(in_srgb,var(--color-accent)_45%,var(--color-border))] " +
    "focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, withIcon, withUnit, style, ...props }, ref) => {
        const mergedStyle = {
            ["--form-padding-block" as any]: "0.75rem",
            ["--form-padding-inline-start" as any]: withIcon ? "2.75rem" : "1rem",
            ["--form-padding-inline-end" as any]: withUnit ? "4rem" : "1rem",
            ...style,
        } as React.CSSProperties;

        return (
            <textarea
                ref={ref}
                className={clsx(base, className)}
                style={mergedStyle}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";
