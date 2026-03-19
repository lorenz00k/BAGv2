import * as React from "react";
import clsx from "clsx";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    withIcon?: boolean;
    withUnit?: boolean;
};

const base =
    "w-full appearance-none bg-[var(--color-surface)] text-[var(--color-fg)] text-[1rem] " +
    "border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] " +
    "rounded-[var(--radius-xs)] " +
    "py-[var(--form-padding-block)] pl-[var(--form-padding-inline-start)] pr-[var(--form-padding-inline-end)] " +
    "[transition:border-color_var(--transition-fade),box-shadow_var(--transition-fade),background_var(--transition-fade)] " +
    "focus-visible:outline-none " +
    "focus-visible:border-[color-mix(in_srgb,var(--color-accent)_45%,var(--color-border))] " +
    "focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]";

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, withIcon, withUnit, style, ...props }, ref) => {
        const mergedStyle = {
            ["--form-padding-block" as any]: "0.5rem",
            ["--form-padding-inline-start" as any]: withIcon ? "2.75rem" : "1rem",
            ["--form-padding-inline-end" as any]: withUnit ? "4rem" : "1rem",
            ...style,
        } as React.CSSProperties;

        return (
            <div className="relative w-full">
                <select
                    ref={ref}
                    className={clsx(base, className)}
                    style={mergedStyle}
                    {...props}
                />
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--color-fg)]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        );
    }
);
Select.displayName = "Select";
