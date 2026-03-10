import * as React from "react";
import clsx from "clsx";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
    return (
        <label
            className={clsx(
                "block text-[var(--color-fg-subtle)] font-medium mb-2",
                className
            )}
            {...props}
        />
    );
}
