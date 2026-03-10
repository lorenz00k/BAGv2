import type { ReactNode } from "react";

function splitCompoundWords(content: ReactNode): ReactNode {
    if (typeof content === "string") {
        return content.replace(
            /Betriebsanlagengenehmigung/g,
            "Betriebsanlagen\u00adgenehmigung"
        );
    }
    return content;
}

type BreakTextProps = {
    className?: string;
    children: ReactNode;
};

export function BreakText({ className = "", children }: BreakTextProps) {
    return (
        <span
            className={`min-w-0 break-words [overflow-wrap:anywhere] [hyphens:auto] ${className}`}
        >
            {splitCompoundWords(children)}
        </span>
    );
}
