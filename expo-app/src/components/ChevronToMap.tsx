import React from "react";
import { Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";

type Props = { to?: "map" | "back"; className?: string };

export function ChevronToMap({ to = "map", className = "" }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        if (to === "back") {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)/map");
          }
        } else {
          router.replace("/(tabs)/map");
        }
      }}
      className={`absolute top-12 right-4 z-50 h-11 w-11 items-center justify-center rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-lg active:opacity-75 ${className}`}
      accessibilityLabel={to === "back" ? "Geri" : "Haritaya dön"}
    >
      <ChevronDown size={24} color="#f4f4f5" />
    </Pressable>
  );
}
