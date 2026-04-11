"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/typography/Heading";
import { Text } from "@/components/typography/Text";
import { Container } from "@/components/layout/Container";
import { useAuth } from "@/context/AuthContext";
import { useChangePassword } from "../hooks/useChangePassword";
import { useSessions } from "../hooks/useSessions";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import type { SessionInfo } from "@/services/account";

function ChangePasswordSection() {
  const t = useTranslations("pages.account.changePassword");
  const { status, error, submit, reset } = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (status === "success") {
    return (
      <Card variant="subtle" className="p-6 hover:translate-y-0">
        <Heading as="h2" className="mt-0">{t("title")}</Heading>
        <Text size="base" className="mt-2 text-green-700">{t("success")}</Text>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => {
          reset();
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }}>
          {t("again")}
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="subtle" className="p-6 hover:translate-y-0">
      <Heading as="h2" className="mt-0">{t("title")}</Heading>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(currentPassword, newPassword, confirmPassword);
        }}
        className="mt-4 grid gap-4 max-w-sm"
      >
        <div>
          <Label htmlFor="currentPassword">{t("currentLabel")}</Label>
          <Input id="currentPassword" type="password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <div>
          <Label htmlFor="newPassword">{t("newLabel")}</Label>
          <Input id="newPassword" type="password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirmNewPassword">{t("confirmLabel")}</Label>
          <Input id="confirmNewPassword" type="password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
        {error && <Text size="sm" className="mt-0 text-red-600">{error}</Text>}
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? t("submitting") : t("cta")}
        </Button>
      </form>
    </Card>
  );
}

function SessionsSection() {
  const t = useTranslations("pages.account.sessions");
  const { sessions, isLoading, revoke } = useSessions();

  return (
    <Card variant="subtle" className="p-6 hover:translate-y-0">
      <Heading as="h2" className="mt-0">{t("title")}</Heading>
      {isLoading ? (
        <Text size="sm" tone="muted" className="mt-2">{t("loading")}</Text>
      ) : sessions.length === 0 ? (
        <Text size="sm" tone="muted" className="mt-2">{t("empty")}</Text>
      ) : (
        <div className="mt-4 grid gap-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between rounded-lg border border-[color-mix(in_srgb,var(--color-border)_60%,transparent)] p-3">
              <div>
                <Text size="sm" className="mt-0">
                  {t("createdAt", { date: new Date(session.createdAt).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) })}
                </Text>
                {session.isCurrent && (
                  <Text size="sm" className="mt-0 font-semibold text-green-700">{t("current")}</Text>
                )}
              </div>
              {!session.isCurrent && (
                <Button variant="ghost" size="sm" onClick={() => revoke(session.id)}>
                  {t("revoke")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function DeleteAccountSection() {
  const t = useTranslations("pages.account.deleteAccount");
  const { status, error, requestDelete, cancel, confirm } = useDeleteAccount();
  const [password, setPassword] = useState("");

  return (
    <Card variant="subtle" className="border-red-200 p-6 hover:translate-y-0">
      <Heading as="h2" className="mt-0 text-red-700">{t("title")}</Heading>
      <Text size="sm" tone="muted" className="mt-2">{t("description")}</Text>

      {status === "idle" && (
        <Button variant="outline" size="sm" className="mt-4 text-red-600 border-red-300" onClick={requestDelete}>
          {t("cta")}
        </Button>
      )}

      {(status === "confirming" || status === "submitting" || status === "error") && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirm(password);
          }}
          className="mt-4 grid gap-4 max-w-sm"
        >
          <Text size="sm" className="mt-0 text-red-600 font-semibold">{t("warning")}</Text>
          <div>
            <Label htmlFor="deletePassword">{t("passwordLabel")}</Label>
            <Input id="deletePassword" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <Text size="sm" className="mt-0 text-red-600">{error}</Text>}
          <div className="flex gap-3">
            <Button type="submit" variant="outline" size="sm" className="text-red-600 border-red-300"
              disabled={status === "submitting"}>
              {status === "submitting" ? t("deleting") : t("confirmCta")}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              {t("cancel")}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function AccountSettingsView() {
  const t = useTranslations("pages.account");
  const { user } = useAuth();

  return (
    <Container>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Heading as="h1" className="mt-0 mb-8">{t("title")}</Heading>
        <Text size="base" tone="muted" className="mt-0 mb-8">{user?.email}</Text>

        <div className="grid gap-6">
          <ChangePasswordSection />
          <SessionsSection />
          <DeleteAccountSection />
        </div>
      </div>
    </Container>
  );
}