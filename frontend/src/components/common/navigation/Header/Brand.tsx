// Brand.tsx
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/locales";

export function Brand({ locale }: { locale: Locale }) {
    const tItems = useTranslations("common.items");

    return (
        <div className="flex min-w-0 flex-shrink-0 items-center">
            <Link href={`/${locale}`} className="flex items-center gap-2">
                <Image
                    src="/assets/icons/icon.svg"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-lg shadow-sm"
                />
                <span className="ml-2 truncate text-sm font-semibold text-current">
                    {tItems("app")}
                </span>
            </Link>
        </div>
    );
}