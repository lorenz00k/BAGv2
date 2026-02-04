import type { HTMLAttributes } from "react";
import clsx from "clsx";

type CardGridProps = HTMLAttributes<HTMLDivElement> & {
    columns?: 1 | 2 | 3;
};

export function CardGrid({ columns = 1, className, ...props }: CardGridProps) {
    return (
        <div
            className={clsx(
                "grid gap-[clamp(1.5rem,3vw,2rem)]",
                columns === 2 && "min-[900px]:grid-cols-2",
                columns === 3 && "min-[900px]:grid-cols-3",
                className
            )}
            {...props}
        />
    );
}
