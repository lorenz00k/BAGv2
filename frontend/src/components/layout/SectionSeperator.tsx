import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function SectionSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={clsx(
                "h-px bg-[rgba(31,36,48,0.08)] w-[min(var(--container-w),100%)] mx-auto",
                className
            )}
            {...props}
        />
    );
}
