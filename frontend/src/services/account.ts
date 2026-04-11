import { fetchApi } from "./api";

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await fetchApi("/api/account/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export type SessionInfo = {
  id: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export async function getSessions(): Promise<SessionInfo[]> {
  const data = await fetchApi<{ sessions: SessionInfo[] }>("/api/account/sessions");
  return data.sessions;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetchApi(`/api/account/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function deleteAccount(password: string): Promise<void> {
  await fetchApi("/api/account", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}