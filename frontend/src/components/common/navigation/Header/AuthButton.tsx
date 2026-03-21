// AuthButtons.tsx
"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/locales";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function AuthButtons({ locale }: { locale: Locale }) {
    const tActions = useTranslations("common.actions");
    const { user, isLoading, logout } = useAuth();

    const pathName = usePathname();

    if (isLoading) return null;

    return user ? (
        <div className="flex items-center gap-2">
            <span className="max-w-32 truncate text-sm text-(--color-header-fg-muted)">
                {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={async () => {
                await logout();
                window.location.href = `/${locale}`;
            }}>
                {tActions("auth.logout")}
            </Button>
        </div>
    ) : (
        <Link href={`/${locale}/login?redirect=${encodeURIComponent(pathName)}`}>
            <Button variant="primary" size="sm">
                {tActions("auth.login")}
            </Button>
        </Link>
    );
}