import { Platform } from "react-native";
import Constants from "expo-constants";

function getDefaultApiBase(): string {
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  const ip = debuggerHost ? debuggerHost.split(":")[0] : "10.0.3.105";

  if (Platform.OS === "web") {
    return "http://localhost:3001";
  }
  return `http://${ip}:3001`;
}

export let API_BASE = getDefaultApiBase();

export function setApiBase(url: string) {
  API_BASE = url;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    body: body instanceof FormData ? body : body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
