"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslations } from "next-intl";

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const tRegister = useTranslations("pages.auth.register");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side Validierung
    if (password.length < 8) {
      setError(tRegister("emailPlaceholder"));
      return;
    }
    if (password !== confirmPassword) {
      setError(tRegister("errorPasswordMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : tRegister("errorDefault"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-var(--header-h)-8rem)] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full">
        <h1 className="text-2xl font-bold text-(--color-fg)">
          {tRegister("title")}
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <Label htmlFor="email"> {tRegister("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">{tRegister("passwordLabel")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">{tRegister("confirmPasswordLabel")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-(--color-warning)" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? tRegister("submittingButton") : tRegister("submitButton")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-(--color-fg-subtle)">
          {tRegister("hasAccountText")}{" "}
          <Link
            href={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="font-medium text-(--color-accent) hover:underline"
          >
            {tRegister("loginLink")}
          </Link>
        </p>
      </Card>
    </main>
  );
}
