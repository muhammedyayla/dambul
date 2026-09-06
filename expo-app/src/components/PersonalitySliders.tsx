import React from "react";
import { View, Text, Pressable } from "react-native";
import type { PersonalityKey } from "../types";

/** 0–19 çubuk indeksi → DB’de 0–100 */
export function barsToDb(b: number): number {
  return Math.round((b / 19) * 100);
}

/** DB'deki 0–100 → 0–19 çubuk indeksi */
export function dbToBars(v: number): number {
  return Math.round((v / 100) * 19);
}

type PersonalitySlidersProps = {
  values: {
    personality_humor: number;
    personality_energy: number;
    personality_lifestyle: number;
    personality_first_step: number;
    personality_love_language: number;
    personality_weekend: number;
  };
  onChange: (key: PersonalityKey, dbValue: number) => void;
};

export function PersonalitySliders({ values, onChange }: PersonalitySlidersProps) {
  const traits = [
    { key: "personality_humor", label: "Mizahın", left: "Alaycı", right: "Pozitif" },
    { key: "personality_energy", label: "Enerji", left: "İçe dönük", right: "Dışa dönük" },
    { key: "personality_lifestyle", label: "Yaşam tarzın", left: "Güvenli", right: "Maceracı" },
    { key: "personality_first_step", label: "İlk adım", left: "Ben atarım", right: "Beklerim" },
    { key: "personality_love_language", label: "Aşk dilin", left: "Kelime", right: "Dokunma" },
    { key: "personality_weekend", label: "Hafta sonu", left: "Evde chill", right: "Macera" },
  ] as const;

  return (
    <View className="gap-y-4">
      {traits.map((t) => (
        <BarScale20
          key={t.key}
          label={t.label}
          left={t.left}
          right={t.right}
          value={dbToBars(values[t.key] ?? 50)}
          onChange={(v) => onChange(t.key, barsToDb(v))}
        />
      ))}
    </View>
  );
}

function BarScale20({
  label,
  left,
  right,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="my-1">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-xs text-zinc-500">{left}</Text>
        <Text className="text-xs font-semibold text-zinc-300">{label}</Text>
        <Text className="text-xs text-zinc-500">{right}</Text>
      </View>
      <View className="flex-row items-center gap-[2px]">
        {Array.from({ length: 20 }, (_, i) => (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            className={`h-9 flex-1 rounded-[2px] border border-zinc-800 ${
              i <= value ? "bg-violet-600" : "bg-zinc-800/80"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
