import type { ReactNode, CSSProperties } from "react";
import clsx from "clsx";

type AutoGridProps = {
    children: ReactNode;
    className?: string;
    min?: string; // z.B. "16rem" oder "240px"
    gap?: string; // z.B. "1rem" oder "24px"
};

export function AutoGrid({
    children,
    className,
    min = "16rem",
    gap = "1rem",
}: AutoGridProps) {
    const style: CSSProperties = {
        ["--min" as any]: min,
        ["--gap" as any]: gap,
    };

    return (
        <div
            className={clsx(
                "grid",
                "[grid-template-columns:repeat(auto-fit,minmax(var(--min),1fr))]",
                "gap-[var(--gap)]",
                className
            )}
            style={style}
        >
            {children}
        </div>
    );
}
