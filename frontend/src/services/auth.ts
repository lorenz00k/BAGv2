import { fetchApi } from "./api";
import type { AuthUser } from "@/types/auth";

export async function register(email: string, password:string): Promise<AuthUser>{
    const data = await fetchApi<{user: AuthUser}> ("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({email, password}),
    });

    return data.user;
}

export async function login(email:string, password:string): Promise<AuthUser> {
    const data = await fetchApi<{user: AuthUser}> ("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({email, password}),
    });
    return data.user;
}

export async function logout(): Promise<void>{
    await fetchApi("/api/auth/logout", {
        method: "POST"
    });
}

export async function getMe(): Promise<AuthUser>{
    const data = await fetchApi<{user: AuthUser}>("/api/user/me");
    return data.user;
}