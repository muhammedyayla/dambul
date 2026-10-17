import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, MapPin, ChevronDown, Check } from "lucide-react-native";
import { apiPatch, apiPost } from "../src/api";
import { uploadImageAsset } from "../src/upload";
import type { ImagePickerAsset } from "expo-image-picker";
import { PersonalitySliders } from "../src/components/PersonalitySliders";

function ageToBirthDate(age: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [prefGender, setPrefGender] = useState<"female" | "male" | "everyone">("female");
  const [bio, setBio] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [pickedAsset, setPickedAsset] = useState<ImagePickerAsset | null>(null);

  const [personality, setPersonality] = useState({
    personality_humor: 50,
    personality_energy: 50,
    personality_lifestyle: 50,
    personality_first_step: 50,
    personality_love_language: 50,
    personality_weekend: 50,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin Gerekli", "Fotoğraf seçebilmek için galeri izni gereklidir.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
      exif: false,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      setImageUri(res.assets[0].uri);
      setPickedAsset(res.assets[0]);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!imageUri) {
      setErrorMsg("Lütfen bir profil fotoğrafı yükleyin.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("İsim alanı zorunludur.");
      return;
    }
    if (!city.trim()) {
      setErrorMsg("Lütfen şehrinizi belirtin.");
      return;
    }

    setLoading(true);
    try {
      const uploaded = pickedAsset
        ? await uploadImageAsset(pickedAsset)
        : null;
      if (!uploaded?.url) {
        throw new Error("Fotoğraf yükleme başarısız oldu.");
      }
      const avatar_url = uploaded.url;

      // 2. Patch user profile
      await apiPatch("/api/users/me", {
        name: name.trim(),
        city: city.trim(),
        lat: 41.0082,
        lng: 28.9784,
        birth_date: ageToBirthDate(age),
        height: heightCm,
        pref_gender: prefGender,
        bio: bio.trim() || null,
        avatar_url,
        tags: [],
        ...personality,
      });
      await apiPost("/api/users/me/photos", {
        url: avatar_url,
        public_id: uploaded.public_id,
        order_index: 0,
      }).catch(() => undefined);

      router.replace("/(tabs)/map");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60, paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl font-black text-white">Profilini Tamamla</Text>
        <Text className="text-xs text-zinc-400 mt-1 mb-6">
          Diğer kullanıcılarla eşleşmek için profilini oluştur.
        </Text>

        {/* Photo Selection */}
        <View className="items-center mb-6">
          <Pressable
            onPress={pickImage}
            className="relative h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-violet-500 bg-zinc-900 active:opacity-80"
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="h-full w-full object-cover" />
            ) : (
              <View className="items-center">
                <Camera size={32} color="#8b5cf6" />
                <Text className="mt-2 text-xs font-semibold text-violet-400">Fotoğraf Ekle</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Name */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">İsim</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Adınızı girin"
            placeholderTextColor="#71717a"
            className="h-13 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-base text-white"
          />
        </View>

        {/* City */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Şehir</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Örn: İstanbul, Ankara..."
            placeholderTextColor="#71717a"
            className="h-13 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-base text-white"
          />
        </View>

        {/* Age Stepper */}
        <View className="mb-5">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">Yaş</Text>
            <Text className="text-sm font-bold text-violet-400">{age}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setAge((prev) => Math.max(18, prev - 1))}
              className="h-12 w-16 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 active:bg-zinc-800"
            >
              <Text className="text-xl font-bold text-white">-</Text>
            </Pressable>
            <View className="flex-1 h-12 items-center justify-center rounded-xl bg-zinc-900/60">
              <Text className="text-base font-semibold text-white">{age} yaşında</Text>
            </View>
            <Pressable
              onPress={() => setAge((prev) => Math.min(100, prev + 1))}
              className="h-12 w-16 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 active:bg-zinc-800"
            >
              <Text className="text-xl font-bold text-white">+</Text>
            </Pressable>
          </View>
        </View>

        {/* Height Stepper */}
        <View className="mb-5">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">Boy</Text>
            <Text className="text-sm font-bold text-violet-400">{heightCm} cm</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setHeightCm((prev) => Math.max(130, prev - 1))}
              className="h-12 w-16 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 active:bg-zinc-800"
            >
              <Text className="text-xl font-bold text-white">-</Text>
            </Pressable>
            <View className="flex-1 h-12 items-center justify-center rounded-xl bg-zinc-900/60">
              <Text className="text-base font-semibold text-white">{heightCm} cm</Text>
            </View>
            <Pressable
              onPress={() => setHeightCm((prev) => Math.min(230, prev + 1))}
              className="h-12 w-16 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 active:bg-zinc-800"
            >
              <Text className="text-xl font-bold text-white">+</Text>
            </Pressable>
          </View>
        </View>

        {/* Gender Preference */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            İlgilendiğim Cinsiyet
          </Text>
          <View className="flex-row gap-2">
            {(
              [
                { label: "Kadınlar", value: "female" },
                { label: "Erkekler", value: "male" },
                { label: "Herkes", value: "everyone" },
              ] as const
            ).map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setPrefGender(item.value)}
                className={`flex-1 h-12 items-center justify-center rounded-xl border ${
                  prefGender === item.value
                    ? "border-violet-500 bg-violet-600/20"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    prefGender === item.value ? "text-violet-300" : "text-zinc-400"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Hakkında
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Kendinden kısaca bahset..."
            placeholderTextColor="#71717a"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-base text-white"
          />
        </View>

        {/* Personality Sliders */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-violet-400 mb-3">Kişilik Ölçeği</Text>
          <PersonalitySliders
            values={personality}
            onChange={(key, val) => setPersonality((p) => ({ ...p, [key]: val }))}
          />
        </View>

        {errorMsg ? (
          <Text className="text-sm text-rose-400 text-center mb-4">{errorMsg}</Text>
        ) : null}

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="h-14 w-full items-center justify-center rounded-2xl bg-violet-600 active:bg-violet-700"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">Devam Et</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
