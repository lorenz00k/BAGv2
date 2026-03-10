import type { HTMLAttributes } from "react";
import clsx from "clsx";

type FormRowProps = HTMLAttributes<HTMLDivElement> & {
    split?: boolean; // entspricht form-row--split
};

export function FormRow({ split = false, className, ...props }: FormRowProps) {
    return (
        <div
            className={clsx(
                "grid gap-4",
                split && "md:grid-cols-2",
                className
            )}
            {...props}
        />
    );
}