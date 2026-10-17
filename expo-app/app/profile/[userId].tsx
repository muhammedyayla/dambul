import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { apiGet, apiPost } from "../../src/api";
import { ProfileDetailView, ProfileDetailUser } from "../../src/components/ProfileDetailView";
import type { SessionUser } from "../../src/types";

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileDetailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVote, setCurrentVote] = useState<"like" | "pass" | null>(null);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        const me = await apiGet<SessionUser>("/api/auth/me");
        if (me.id === userId) {
          router.replace("/settings" as any);
          return;
        }
        const prof = await apiGet<ProfileDetailUser>(`/api/users/${userId}`);
        setProfile(prof);
        setCurrentVote(prof.existing_vote || null);
        await apiPost("/api/profile-views", { viewed_id: userId });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, router]);

  // Re-vote handler ("Fikrin mi değişti?")
  const handleReVote = async (type: "like" | "pass") => {
    if (!profile) return;
    try {
      const res = await apiPost<{ matched?: boolean; thread_id?: string | null }>("/api/likes", {
        to_user: profile.id,
        type,
      });
      setCurrentVote(type);
      if (type === "like") {
        if (res.matched && res.thread_id) {
          Alert.alert("Tebrikler!", "Harika bir eşleşme yakaladın!", [
            { text: "Sonra", style: "cancel" },
            {
              text: "Sohbete Git",
              onPress: () => router.push(`/chat/${res.thread_id}` as any),
            },
          ]);
        } else {
          Alert.alert("Başarılı", `${profile.name} beğenildi.`);
        }
      } else {
        Alert.alert("Bilgi", `${profile.name} pas geçildi.`);
      }
    } catch {
      Alert.alert("Hata", "Oylama kaydedilemedi.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#FF007F" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center p-5">
        <Text className="text-zinc-400 text-base font-semibold">Profil bulunamadı.</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-xl bg-zinc-800 px-5 py-2.5"
        >
          <Text className="text-white text-xs font-bold">Geri Dön</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#09090b" }}>
      {/* Top Navigation Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-zinc-900 active:bg-zinc-800"
        >
          <ChevronLeft size={22} color="#ffffff" />
        </Pressable>
        <Text className="text-base font-black text-white">{profile.name}</Text>
        <View className="w-10" />
      </View>

      {/* Shared Single-Source Profile Detail View */}
      <ProfileDetailView
        user={profile}
        existingVote={currentVote}
        onReVote={handleReVote}
        onBlockSuccess={() => router.back()}
        onReportSuccess={() => router.back()}
        contentPaddingBottom={40}
      />
    </SafeAreaView>
  );
}
