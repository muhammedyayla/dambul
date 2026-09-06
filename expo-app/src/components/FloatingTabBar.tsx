import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Flame, MessageCircle, Sparkles, Bell } from "lucide-react-native";
import { apiFetch } from "../api";

export function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/notifications/unread-count");
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setUnread(data.count);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const tabs = [
    { path: "/(tabs)/swipe", label: "Swipe", Icon: Flame },
    { path: "/(tabs)/chat", label: "Chat", Icon: MessageCircle },
    { path: "/(tabs)/vibe", label: "Vibe", Icon: Sparkles },
    { path: "/(tabs)/notifications", label: "Bildirim", Icon: Bell, badge: unread },
  ];

  return (
    <View className="absolute bottom-8 left-4 right-4 z-50 flex-row items-center justify-around rounded-full border border-zinc-700/80 bg-zinc-950/95 px-3 py-2 shadow-2xl">
      {tabs.map((t) => {
        const isActive = pathname.startsWith(t.path);
        const IconComponent = t.Icon;
        return (
          <Pressable
            key={t.path}
            onPress={() => router.push(t.path as any)}
            className={`relative flex-1 items-center justify-center rounded-full py-2 ${
              isActive ? "bg-zinc-700" : "bg-transparent"
            }`}
          >
            <View className="relative items-center">
              <IconComponent size={18} color={isActive ? "#ffffff" : "#a1a1aa"} />
              <Text
                className={`mt-0.5 text-[11px] font-semibold ${
                  isActive ? "text-white" : "text-zinc-400"
                }`}
              >
                {t.label}
              </Text>
              {t.badge != null && t.badge > 0 ? (
                <View className="absolute -top-1 -right-3 h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1">
                  <Text className="text-[9px] font-bold text-white">
                    {t.badge > 9 ? "9+" : t.badge}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
