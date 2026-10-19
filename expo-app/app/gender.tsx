import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { apiPatch } from "../src/api";

export default function GenderScreen() {
  const router = useRouter();
  const [gender, setGender] = useState<"female" | "male" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!gender || saving) return;
    setSaving(true);
    setError(null);
    try {
      await apiPatch("/api/users/me", { gender });
      router.replace("/(tabs)/map");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cinsiyet kaydedilemedi. Tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-zinc-950 px-6">
      <View className="w-full max-w-sm self-center">
        <Text className="text-3xl font-black text-white">Cinsiyetim</Text>
        <Text className="mt-2 text-sm leading-6 text-zinc-400">
          Profilinizi kullanmaya devam etmek için cinsiyetinizi seçin.
        </Text>

        <View className="mt-8 gap-3">
          {([
            { label: "Kadın", value: "female" },
            { label: "Erkek", value: "male" },
          ] as const).map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setGender(option.value)}
              className={`h-14 flex-row items-center justify-between rounded-2xl border px-5 ${
                gender === option.value
                  ? "border-violet-500 bg-violet-600/20"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  gender === option.value ? "text-violet-300" : "text-zinc-300"
                }`}
              >
                {option.label}
              </Text>
              {gender === option.value ? <Check size={20} color="#c4b5fd" /> : null}
            </Pressable>
          ))}
        </View>

        {error ? <Text className="mt-4 text-sm text-rose-400">{error}</Text> : null}

        <Pressable
          onPress={() => void save()}
          disabled={!gender || saving}
          className={`mt-6 h-14 items-center justify-center rounded-2xl ${
            gender && !saving ? "bg-violet-600 active:bg-violet-700" : "bg-zinc-800"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">Devam Et</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
