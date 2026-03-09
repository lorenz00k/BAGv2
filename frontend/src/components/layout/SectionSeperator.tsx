import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function SectionSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={clsx(
                "w-[min(var(--container-w),100%)] mx-auto bg-[var(--separator-color)] h-[var(--separator-height)]",
                className
            )}
            {...props}
        />
    );
}
