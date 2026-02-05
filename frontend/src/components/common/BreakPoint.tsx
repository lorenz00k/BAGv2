export default function BreakPoint({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const className =
        size === "sm"
            ? "h-4"
            : size === "lg"
                ? "h-10"
                : "h-6"

    return <div className={className} aria-hidden="true" />
}
