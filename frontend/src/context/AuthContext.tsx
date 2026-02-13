"use client";
import { AuthUser } from "@/types/auth";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import * as authService from "@/services/auth";

interface AuthContextValue{
    user: AuthUser | null;
    isLoading: boolean;
    login: (email:string, password:string) => Promise<void>;
    register: (email:string, password:string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);  // true! Wir wissen noch nicht

  // Beim ersten Laden: Prüfe ob Session-Cookie noch gültig ist
  useEffect(() => {
    authService.getMe()
      .then((user) => setUser(user))     // Cookie gültig → User setzen
      .catch(() => setUser(null))          // 401 → nicht eingeloggt
      .finally(() => setIsLoading(false)); // Egal was passiert: fertig geladen
  }, []);

  // Login: API aufrufen, bei Erfolg User setzen
  const login = useCallback(async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  }, []);

  // Logout: API aufrufen, User auf null setzen
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // Register: NUR registrieren, NICHT einloggen
  const register = useCallback(async (email: string, password: string) => {
    await authService.register(email, password);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

