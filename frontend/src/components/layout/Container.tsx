import type { HTMLAttributes } from "react";
import clsx from "clsx";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...props }: ContainerProps) {
    return (
        <div
            className={clsx(
                "w-[min(var(--container-w),100%)] mx-auto px-[var(--container-padding)]",
                className
            )}
            {...props}
        />
    );
}
