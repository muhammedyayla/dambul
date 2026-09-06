import { redirect } from "react-router";
import { apiFetch } from "../api";
import type { SessionUser } from "../types";
import { profileComplete } from "../types";

/** Returns null if not logged in, API unreachable, or error response (avoid loader crash). */
export async function fetchMe(): Promise<SessionUser | null> {
  try {
    const res = await apiFetch("/api/auth/me");
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const j = (await res.json()) as SessionUser & { tags?: unknown };
    return {
      ...j,
      tags: Array.isArray(j.tags) ? (j.tags as string[]) : [],
      personality_humor: j.personality_humor ?? 50,
      personality_energy: j.personality_energy ?? 50,
      personality_lifestyle: j.personality_lifestyle ?? 50,
      personality_first_step: j.personality_first_step ?? 50,
      personality_love_language: j.personality_love_language ?? 50,
      personality_weekend: j.personality_weekend ?? 50,
    };
  } catch {
    // Sunucu kapalı veya ağ hatası — "Failed to fetch" burada yakalanır
    return null;
  }
}

/** Require login; optional redirect to onboarding if profile incomplete (except on /onboarding). */
export async function requireSession(request: Request): Promise<SessionUser> {
  const user = await fetchMe();
  if (!user) throw redirect("/login");
  const url = new URL(request.url);
  const onOnboarding = url.pathname === "/onboarding";
  if (!profileComplete(user) && !onOnboarding) throw redirect("/onboarding");
  if (profileComplete(user) && onOnboarding) throw redirect("/map");
  return user;
}

export async function requireSessionAllowIncomplete(): Promise<SessionUser> {
  const user = await fetchMe();
  if (!user) throw redirect("/login");
  return user;
}

export async function onboardingLoader() {
  const user = await requireSessionAllowIncomplete();
  if (profileComplete(user)) throw redirect("/map");
  return user;
}

export async function rootLoader() {
  const user = await fetchMe();
  if (!user) throw redirect("/login");
  if (!profileComplete(user)) throw redirect("/onboarding");
  throw redirect("/map");
}

export async function loginLoader() {
  const user = await fetchMe();
  if (user) {
    if (profileComplete(user)) throw redirect("/map");
    throw redirect("/onboarding");
  }
  return null;
}
