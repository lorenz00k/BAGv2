// AuthButtons.tsx
"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/locales";

export function AuthButtons({ locale }: { locale: Locale }) {
    const { user, isLoading, logout } = useAuth();
    if (isLoading) return null;

    return user ? (
        <div className="flex items-center gap-2">
            <span className="max-w-32 truncate text-sm text-(--color-header-fg-muted)">
                {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
                Abmelden
            </Button>
        </div>
    ) : (
        <Link href={`/${locale}/login`}>
            <Button variant="primary" size="sm">
                Anmelden
            </Button>
        </Link>
    );
}