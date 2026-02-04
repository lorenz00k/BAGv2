import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type SectionProps = HTMLAttributes<HTMLElement> & {
    size?: "default" | "compact";
    fullBg?: boolean; // entspricht section--full-bg
    children: ReactNode;
};

export function Section({
    size = "default",
    fullBg = false,
    className,
    children,
    ...props
}: SectionProps) {
    const padding =
        size === "compact"
            ? "py-[clamp(2rem,6vw,3.5rem)]"
            : "py-[clamp(3rem,8vw,5rem)]";

    if (fullBg) {
        // entspricht section--full-bg + section--full-bg__inner
        return (
            <section
                className={clsx(
                    "w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] bg-[var(--color-surface)]",
                    className
                )}
                {...props}
            >
                <div
                    className={clsx(
                        "max-w-[var(--container-w)] mx-auto px-[var(--container-padding)] py-[clamp(1.5rem,4vw,2.5rem)]",
                        padding // optional: wenn du full-bg anders paddest, kannst du’s weglassen
                    )}
                >
                    {children}
                </div>
            </section>
        );
    }

    return (
        <section className={clsx(padding, className)} {...props}>
            {children}
        </section>
    );
}
