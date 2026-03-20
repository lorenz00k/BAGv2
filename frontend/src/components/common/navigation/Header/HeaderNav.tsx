"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import type { Locale } from "@/i18n/locales";
import { PRIMARY_NAV } from "@/navigation/nav";

import { Brand } from "./Brand";
import { NavDropdown } from "./NavDropdown";
import { NavLink } from "./NavLink";
import { AuthButtons } from "./AuthButton";
import { MobileMenuButton } from "./MobileMenuButton";
import LanguageSwitcher from "../LanguageSwitcher";
import MobileSidebar from "@/components/common/MobileSidebar/MobileSidebar";

import styles from "./HeaderNav.module.css";

interface HeaderNavProps {
    locale: Locale;
}

export default function HeaderNav({ locale }: HeaderNavProps) {
    const tNav = useTranslations("common.navigation");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    return (
        <header className={`${styles.header} sticky top-0 z-50`}>
            <div className="w-full px-6 lg:px-10">
                <div className="flex h-14 items-center justify-between gap-3">

                    <Brand locale={locale} />

                    <nav
                        className="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-x-6 gap-y-2 lg:flex"
                        aria-label={tNav("aria.primaryMenu")}
                    >
                        {PRIMARY_NAV.map(link =>
                            link.children
                                ? <NavDropdown key={link.labelKey} item={link} locale={locale} />
                                : <NavLink key={link.key} item={link} locale={locale} />
                        )}
                    </nav>

                    <MobileMenuButton
                        onClick={() => setIsSidebarOpen(true)}
                        isOpen={isSidebarOpen}
                    />

                    <div className="hidden min-w-0 flex-shrink-0 items-center gap-3 lg:flex">
                        <LanguageSwitcher />
                        <AuthButtons locale={locale} />
                    </div>

                </div>
            </div>

            <MobileSidebar
                locale={locale}
                open={isSidebarOpen}
                onClose={closeSidebar}
            />
        </header>
    );
}