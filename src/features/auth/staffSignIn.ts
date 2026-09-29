import { authService } from "@/services";

/** Signs board staff in with the password assigned to them and opens the board. */
export async function staffSignIn(email: string, password: string): Promise<void> {
  const response = await fetch("/api/v1/auth/board-login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(data.error?.message ?? "Unable to sign in right now.");
  }
  await authService.getCurrentSession();
  window.location.assign("/board");
}
