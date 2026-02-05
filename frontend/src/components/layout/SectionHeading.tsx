import type { HTMLAttributes } from "react";
import clsx from "clsx";
import { BreakText } from "../common/BreakText";

export function SectionHeading(props: HTMLAttributes<HTMLDivElement>) {
    const { className, ...rest } = props;
    return (
        <div
            className={clsx(
                "max-w-[150ch] mx-auto text-center grid gap-[0.9rem]",
                className
            )}
            {...rest}
        />
    );
}

export function SectionTitle(props: HTMLAttributes<HTMLHeadingElement>) {
    const { className, children, ...rest } = props;
    return (
        <h2
            className={clsx(
                "text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.15] font-bold",
                className
            )}
            {...rest}
        >
            <BreakText>{children}</BreakText>
        </h2 >
    );
}

export function SectionCopy(props: HTMLAttributes<HTMLParagraphElement>) {
    const { className, children, ...rest } = props;
    return (
        <p
            className={clsx("max-w-[65ch] mx-auto text-[var(--color-fg-subtle)]", className)}
            {...rest}
        >
            <BreakText>{children}</BreakText>
        </p>
    );
}

export function SectionSubtitle(props: HTMLAttributes<HTMLParagraphElement>) {
    const { className, children, ...rest } = props;
    return (
        <p
            className={clsx("mt-[0.9rem] max-w-[55ch] mx-auto text-[var(--color-fg-subtle)]", className)}
            {...rest}
        >
            <BreakText>{children}</BreakText>
        </p>
    );
}
