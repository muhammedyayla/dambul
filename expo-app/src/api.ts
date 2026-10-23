import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "./auth";

const STORAGE_KEY = "dambul_api_mode"; // "remote" | "local"
const CUSTOM_IP_KEY = "dambul_local_ip"; // Kullanıcının manuel girdiği IP
const LOCAL_PORT = 3001;

/** Render'daki production backend URL'i */
const REMOTE_API = "https://dambul.onrender.com";

/** Kullanıcının manuel ayarladığı lokal IP (varsa) */
let customLocalIp: string | null = null;

/**
 * Metro/Expo'dan otomatik algılanan IP'yi döndürür.
 * Her çağrıda taze değer okunur — eski cache'e bağımlı değildir.
 */
function detectDebuggerIp(): string {
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  return debuggerHost ? debuggerHost.split(":")[0] : "localhost";
}

/** Lokal backend URL'ini belirle (öncelik: env > manuel IP > otomatik algılama) */
function getLocalApiBase(): string {
  // 1) Env değişkeni varsa her şeyin üstüne çıkar
  const configuredApiBase = process.env.EXPO_PUBLIC_API_URL;
  if (configuredApiBase) {
    return configuredApiBase.replace(/\/+$/, "");
  }

  // 2) Web platformunda localhost kullan
  if (Platform.OS === "web") {
    return __DEV__ ? `http://localhost:${LOCAL_PORT}` : "";
  }

  // 3) Kullanıcının manuel ayarladığı IP varsa onu kullan
  if (customLocalIp) {
    return `http://${customLocalIp}:${LOCAL_PORT}`;
  }

  // 4) Expo/Metro'dan otomatik algıla
  const ip = detectDebuggerIp();
  return `http://${ip}:${LOCAL_PORT}`;
}

/** Şu anki API base URL'i */
export let API_BASE = REMOTE_API; // Varsayılan: Render (production)

/** Şu anki mod: "remote" veya "local" */
export let API_MODE: "remote" | "local" = "remote";

/** API base URL'ini ayarla */
export function setApiBase(url: string) {
  API_BASE = url;
}

/**
 * Lokal geliştirme IP'sini manuel olarak ayarla.
 * Farklı bir bilgisayara geçildiğinde otomatik algılama yetersiz kalırsa
 * kullanıcı bu fonksiyonla IP'yi override edebilir.
 */
export async function setCustomLocalIp(ip: string | null): Promise<void> {
  customLocalIp = ip;
  try {
    if (ip) {
      await AsyncStorage.setItem(CUSTOM_IP_KEY, ip);
    } else {
      await AsyncStorage.removeItem(CUSTOM_IP_KEY);
    }
  } catch {
    /* ignore */
  }
  // Eğer şu an lokal moddaysak, yeni IP ile API_BASE'i güncelle
  if (API_MODE === "local") {
    API_BASE = getLocalApiBase();
  }
}

/** Kaydedilmiş manuel IP'yi döndürür (UI'da göstermek için) */
export function getCustomLocalIp(): string | null {
  return customLocalIp;
}

/** Backend modunu değiştir (remote = Render, local = lokal sunucu) */
export async function setApiMode(mode: "remote" | "local"): Promise<void> {
  API_MODE = mode;
  if (mode === "remote") {
    API_BASE = REMOTE_API;
  } else {
    API_BASE = getLocalApiBase();
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore storage errors */
  }
}

/** Kaydedilmiş modu ve manuel IP'yi AsyncStorage'dan yükle (uygulama başlangıcında çağır) */
export async function loadApiMode(): Promise<void> {
  try {
    // Önce kaydedilmiş manuel IP'yi yükle
    const savedIp = await AsyncStorage.getItem(CUSTOM_IP_KEY);
    if (savedIp) {
      customLocalIp = savedIp;
    }
    // Sonra modu yükle
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === "local" || saved === "remote") {
      await setApiMode(saved);
    } else {
      // İlk açılış: varsayılan remote
      await setApiMode("remote");
    }
  } catch {
    await setApiMode("remote");
  }
}

/** Lokal sunucunun tam URL'ini döndür (debug/UI amaçlı) */
export function getLocalIp(): string {
  return getLocalApiBase();
}

/** Otomatik algılanan IP'yi döndür (debug/UI amaçlı) */
export function getAutoDetectedIp(): string {
  return detectDebuggerIp();
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);

  // Attach JWT token for mobile auth
  const token = await getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

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
