"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      {/* Subtiler Hintergrund-Akzent für den "Coolness"-Faktor */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-(--color-accent) opacity-5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-(--color-accent) opacity-5 blur-[120px]" />
      </div>

      <Card className="w-full max-w-[420px] border-white/10 bg-white/70 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl :bg-green">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-(--color-fg)">
            Willkommen zurück
          </h1>
          <p className="mt-2 text-sm text-(--color-fg-subtle)">
            Bitte melde dich mit deinen Zugangsdaten an.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider opacity-70">
              E-Mail-Adresse
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@beispiel.de"
              className="h-11 border-zinc-200 bg-white/50 transition-all focus:ring-2 focus:ring-(--color-accent) dark:border-zinc-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Passwort
              </Label>
              <Link href="#" className="text-xs text-(--color-accent) hover:underline">
                Vergessen?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11 border-zinc-200 bg-white/50 transition-all focus:ring-2 focus:ring-(--color-accent) dark:border-zinc-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="h-11 w-full bg-(--color-fg) text-(--color-bg) transition-transform active:scale-[0.98] hover:opacity-90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Wird angemeldet...
              </span>
            ) : (
              "Anmelden"
            )}
          </Button>
        </form>

        <div className="mt-8 border-t border-zinc-100 pt-6 text-center dark:border-zinc-800">
          <p className="text-sm text-(--color-fg-subtle)">
            Noch kein Konto?{" "}
            <Link href="/register" className="font-semibold text-(--color-accent) transition-colors hover:text-(--color-accent-emphasis)">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </Card>
    </main>
  );
}