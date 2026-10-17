import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Globe, Layers, MessageCircle, Bell } from "lucide-react-native";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#71717a",
        tabBarStyle: {
          backgroundColor: "#09090b",
          borderTopColor: "#27272a",
          height: 52 + bottomPad,
          paddingTop: 6,
          paddingBottom: bottomPad,
        },
      }}
    >
      {/* 1. Harita (Planet / Globe) */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Harita",
          tabBarIcon: ({ color, size }) => <Globe size={size - 2} color={color} />,
        }}
      />

      {/* 2. Swipe (Cards / Layers) */}
      <Tabs.Screen
        name="swipe"
        options={{
          title: "Swipe",
          tabBarIcon: ({ color, size }) => <Layers size={size - 2} color={color} />,
        }}
      />

      {/* 3. Mesajlar (Chat / MessageCircle) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Sohbet",
          tabBarIcon: ({ color, size }) => <MessageCircle size={size - 2} color={color} />,
        }}
      />

      {/* 4. Bildirimler (Bell) */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Bildirim",
          tabBarIcon: ({ color, size }) => <Bell size={size - 2} color={color} />,
        }}
      />

      {/* Vibe sekmesi alt menüden kaldırıldı (Harita üzerindeki yüzen buton ile açılacak) */}
      <Tabs.Screen
        name="vibe"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
