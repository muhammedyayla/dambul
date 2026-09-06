import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { apiFetch } from "../src/api";
import { profileComplete, type SessionUser } from "../src/types";

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await apiFetch("/api/auth/me");
        if (cancelled) return;
        if (res.status === 401 || !res.ok) {
          router.replace("/login");
          return;
        }
        const u = (await res.json()) as SessionUser;
        if (!profileComplete(u)) {
          router.replace("/onboarding");
        } else {
          router.replace("/(tabs)/map");
        }
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-zinc-950">
      <Text className="text-4xl font-black text-white tracking-wider mb-4">Dambul</Text>
      <ActivityIndicator size="large" color="#8b5cf6" />
    </View>
  );
}
