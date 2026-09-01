import { clearSession, djangoRequest, sessionRefreshToken } from "@/lib/server/session";

export async function POST() {
  const refresh = await sessionRefreshToken();
  if (refresh) await djangoRequest("auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) }, false);
  await clearSession();
  return new Response(null, { status: 204 });
}
