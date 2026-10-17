import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  Wine,
  Cigarette,
  MessageSquare,
  Compass,
  Activity,
  Tag,
  Search,
  Check,
  Smile,
  PawPrint,
  GraduationCap,
  Trophy,
  Globe,
} from "lucide-react-native";
import { apiGet, apiPatch, apiPost, apiDelete } from "../src/api";
import { clearToken } from "../src/auth";
import { pickAndUploadPhoto } from "../src/upload";
import type { SessionUser } from "../src/types";
import { PersonalitySliders } from "../src/components/PersonalitySliders";
import { VibeRadarChart } from "../src/components/VibeRadarChart";
import {
  PERSONALITY_TYPES,
  ALCOHOL_OPTIONS,
  SMOKING_OPTIONS,
  COMMUNICATION_STYLES,
  LOOKING_FOR_OPTIONS,
  ACTIVITIES_OPTIONS,
  SPORTS_OPTIONS,
  LIFESTYLE_TAGS,
  ZODIAC_SIGNS,
  PETS_OPTIONS,
  EDUCATION_OPTIONS,
  MAX_LIFESTYLE_SELECTIONS,
  LANGUAGES_OPTIONS,
} from "../src/constants/profileOptions";

type UserPhoto = { id: string; url: string; order_index: number };

type CategoryDef = {
  key: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBg: string;
  options: readonly string[];
  maxSelections?: number;
  isArrayField?: boolean;
};

const CATEGORIES: CategoryDef[] = [
  {
    key: "looking_for",
    title: "İlişki Hedefi",
    icon: Compass,
    iconColor: "#fcd34d",
    iconBg: "rgba(252, 211, 77, 0.15)",
    options: LOOKING_FOR_OPTIONS,
  },
  {
    key: "languages",
    title: "Bildiği Diller",
    icon: Globe,
    iconColor: "#38bdf8",
    iconBg: "rgba(56, 189, 248, 0.15)",
    options: LANGUAGES_OPTIONS,
    isArrayField: true,
  },
  {
    key: "lifestyle_tags",
    title: "Yaşam Tarzı",
    icon: Tag,
    iconColor: "#a78bfa",
    iconBg: "rgba(167, 139, 250, 0.15)",
    options: LIFESTYLE_TAGS,
    maxSelections: MAX_LIFESTYLE_SELECTIONS,
    isArrayField: true,
  },
  {
    key: "alcohol_habit",
    title: "Alkol Alışkanlığı",
    icon: Wine,
    iconColor: "#6ee7b7",
    iconBg: "rgba(110, 231, 183, 0.15)",
    options: ALCOHOL_OPTIONS,
  },
  {
    key: "smoking_habit",
    title: "Tütün Alışkanlığı",
    icon: Cigarette,
    iconColor: "#a1a1aa",
    iconBg: "rgba(161, 161, 170, 0.15)",
    options: SMOKING_OPTIONS,
  },
  {
    key: "personality_type",
    title: "Kişilik Tipi (MBTI)",
    icon: Sparkles,
    iconColor: "#c084fc",
    iconBg: "rgba(192, 132, 252, 0.15)",
    options: PERSONALITY_TYPES.map((p) => `${p.code} - ${p.category}`),
  },
  {
    key: "communication_style",
    title: "İletişim Tarzı",
    icon: MessageSquare,
    iconColor: "#7dd3fc",
    iconBg: "rgba(125, 211, 252, 0.15)",
    options: COMMUNICATION_STYLES,
  },
  {
    key: "zodiac_sign",
    title: "Burç",
    icon: Smile,
    iconColor: "#f0abfc",
    iconBg: "rgba(240, 171, 252, 0.15)",
    options: ZODIAC_SIGNS,
  },
  {
    key: "pets",
    title: "Evcil Hayvan",
    icon: PawPrint,
    iconColor: "#fdba74",
    iconBg: "rgba(253, 186, 116, 0.15)",
    options: PETS_OPTIONS,
  },
  {
    key: "education_level",
    title: "Eğitim Düzeyi",
    icon: GraduationCap,
    iconColor: "#a5b4fc",
    iconBg: "rgba(165, 180, 252, 0.15)",
    options: EDUCATION_OPTIONS,
  },
  {
    key: "favorite_activities",
    title: "Aktiviteler",
    icon: Activity,
    iconColor: "#f43f5e",
    iconBg: "rgba(244, 63, 94, 0.15)",
    options: ACTIVITIES_OPTIONS,
    isArrayField: true,
  },
  {
    key: "sports",
    title: "Spor & Fitness",
    icon: Trophy,
    iconColor: "#2dd4bf",
    iconBg: "rgba(45, 212, 191, 0.15)",
    options: SPORTS_OPTIONS,
    isArrayField: true,
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [height, setHeight] = useState("");
  const [photosOpen, setPhotosOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Multi-Select Modal State
  const [activeCategory, setActiveCategory] = useState<CategoryDef | null>(null);
  const [tempSelections, setTempSelections] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const me = await apiGet<SessionUser>("/api/auth/me");
        setUser(me);
        setName(me.name || "");
        setCity(me.city || "");
        setBio(me.bio || "");
        setHeight(me.height != null ? String(me.height) : "");
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const patch = async (body: Record<string, unknown>) => {
    try {
      const next = await apiPatch<SessionUser>("/api/users/me", body);
      setUser(next);
      return next;
    } catch {
      Alert.alert("Hata", "Güncelleme kaydedilemedi.");
      return null;
    }
  };

  const saveBasics = async () => {
    setSaving(true);
    const h = parseInt(height, 10);
    await patch({
      name: name.trim(),
      city: city.trim() || null,
      bio: bio.trim() || null,
      height: Number.isNaN(h) ? null : h,
    });
    setSaving(false);
    Alert.alert("Başarılı", "Temel bilgileriniz kaydedildi.");
  };

  const logout = async () => {
    try {
      await clearToken();
      await apiPost("/api/auth/logout", {});
      router.replace("/login");
    } catch {
      router.replace("/login");
    }
  };

  // Helper to get selected items array from user state for any category
  const getSelectedItems = (cat: CategoryDef): string[] => {
    if (!user) return [];
    const val = (user as any)[cat.key];
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  // Open Modal for category
  const openCategoryModal = (cat: CategoryDef) => {
    const current = getSelectedItems(cat);
    setTempSelections([...current]);
    setModalSearch("");
    setActiveCategory(cat);
  };

  // Toggle selection inside modal
  const toggleModalOption = (opt: string) => {
    if (!activeCategory) return;
    const isSelected = tempSelections.includes(opt);

    if (isSelected) {
      setTempSelections(tempSelections.filter((x) => x !== opt));
    } else {
      if (
        activeCategory.maxSelections &&
        tempSelections.length >= activeCategory.maxSelections
      ) {
        Alert.alert(
          "Maksimum Seçim",
          `Bu kategori için en fazla ${activeCategory.maxSelections} seçim yapabilirsiniz.`
        );
        return;
      }
      setTempSelections([...tempSelections, opt]);
    }
  };

  // Save Modal Selections to State and Neon DB
  const saveModalSelections = async () => {
    if (!activeCategory) return;
    const cat = activeCategory;
    const key = cat.key;
    const isArray = cat.isArrayField;

    // Value to send to backend
    let valueToSend: unknown;
    if (isArray) {
      valueToSend = tempSelections;
    } else {
      // For string fields, join with comma if multiple, or null if empty
      valueToSend = tempSelections.length > 0 ? tempSelections.join(", ") : null;
    }

    // Optimistically update local user state
    if (user) {
      setUser({
        ...user,
        [key]: isArray ? tempSelections : (valueToSend as string | null),
      });
    }

    setActiveCategory(null);

    // Persist to Neon DB
    await patch({ [key]: valueToSend });
  };

  // Filtered options in modal
  const filteredModalOptions = useMemo(() => {
    if (!activeCategory) return [];
    if (!modalSearch.trim()) return activeCategory.options;
    const q = modalSearch.toLowerCase();
    return activeCategory.options.filter((opt) => opt.toLowerCase().includes(q));
  }, [activeCategory, modalSearch]);

  if (!user) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: "#09090b", alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#09090b" }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4 border-b border-zinc-900">
        <View>
          <Text className="text-xl font-black text-white">Ayarlar</Text>
          <Text className="text-xs text-zinc-400">Profil ve tercihler</Text>
        </View>
        <Pressable
          onPress={() => router.replace("/(tabs)/map")}
          className="h-10 w-10 items-center justify-center rounded-full bg-zinc-900 active:bg-zinc-800"
        >
          <ChevronDown size={22} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80, gap: 24 }}>
        {/* Avatar & Photo Manage Trigger */}
        <View className="items-center">
          <Pressable
            onPress={() => setPhotosOpen(true)}
            className="relative h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-900"
            style={{ elevation: 8 }}
          >
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} className="h-full w-full object-cover" />
            ) : (
              <Text className="text-4xl font-bold text-zinc-500">{user.name ? user.name.slice(0, 1) : "D"}</Text>
            )}

            <View
              className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full bg-violet-600"
              style={{ elevation: 4 }}
            >
              <Camera size={18} color="#ffffff" />
            </View>
          </Pressable>

          <Text className="text-xl font-black text-white mt-3">{user.name}</Text>
          <Pressable onPress={() => setPhotosOpen(true)} className="mt-1">
            <Text className="text-xs font-semibold text-violet-400">Fotoğrafları Yönet (9 Slot)</Text>
          </Pressable>
        </View>

        {/* Basic Fields */}
        <View className="gap-4">
          <Text className="text-sm font-bold text-zinc-300">Temel Bilgiler</Text>

          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              İsim
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white"
            />
          </View>

          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Şehir
            </Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              className="h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white"
            />
          </View>

          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Hakkında (Bio)
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              placeholder="Kendinden bahset..."
              placeholderTextColor="#71717a"
              style={{ minHeight: 70, textAlignVertical: "top" }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white text-sm"
            />
          </View>

          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Boy (cm)
            </Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
              className="h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white"
            />
          </View>

          <Pressable
            onPress={saveBasics}
            className="h-12 items-center justify-center rounded-xl bg-zinc-800 active:bg-zinc-700"
          >
            <Text className="font-semibold text-white">
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </Pressable>
        </View>

        <View className="h-[1px] bg-zinc-900" />

        {/* Preferences */}
        <View className="gap-4">
          <Text className="text-sm font-bold text-zinc-300">Tercihler</Text>

          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Görmek İstiyorum
            </Text>
            <View className="flex-row gap-2">
              {(
                [
                  { label: "Kadınlar", val: "female" },
                  { label: "Erkekler", val: "male" },
                  { label: "Herkes", val: "everyone" },
                ] as const
              ).map((item) => (
                <Pressable
                  key={item.val}
                  onPress={() => void patch({ pref_gender: item.val })}
                  className={`flex-1 h-11 items-center justify-center rounded-xl border ${
                    user.pref_gender === item.val
                      ? "border-violet-500 bg-violet-600/20"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      user.pref_gender === item.val ? "text-violet-300" : "text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-zinc-300">Maksimum Mesafe</Text>
            <Text className="text-sm font-bold text-violet-400">{user.pref_distance_km} km</Text>
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-zinc-300">Yaş Aralığı</Text>
            <Text className="text-sm font-bold text-violet-400">
              {user.pref_age_min} - {user.pref_age_max}
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-zinc-900" />

        {/* Personality Sliders */}
        <View>
          <Text className="text-sm font-bold text-zinc-300 mb-3">Kişilik Ölçeği</Text>
          <PersonalitySliders
            values={{
              personality_humor: user.personality_humor,
              personality_energy: user.personality_energy,
              personality_lifestyle: user.personality_lifestyle,
              personality_first_step: user.personality_first_step,
              personality_love_language: user.personality_love_language,
              personality_weekend: user.personality_weekend,
            }}
            onChange={(key, val) => void patch({ [key]: val })}
          />
        </View>

        <View className="h-[1px] bg-zinc-900" />

        {/* PROFILE DETAILS - FULL-SCREEN MULTI-SELECT ROWS */}
        <View className="gap-3">
          <View className="mb-2">
            <Text className="text-base font-black text-white">Profil Detayları & Alışkanlıklar</Text>
            <Text className="text-xs text-zinc-400 mt-0.5">
              Detayları seçmek için başlıklara tıklayın
            </Text>
          </View>

          <View className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden">
            {CATEGORIES.map((cat, idx) => {
              const IconComponent = cat.icon;
              const selectedItems = getSelectedItems(cat);
              const hasSelection = selectedItems.length > 0;
              const isLast = idx === CATEGORIES.length - 1;

              let summaryText = "Seçilmedi";
              if (hasSelection) {
                if (selectedItems.length === 1) {
                  summaryText = selectedItems[0];
                } else if (selectedItems.length === 2) {
                  summaryText = `${selectedItems[0]}, ${selectedItems[1]}`;
                } else {
                  summaryText = `${selectedItems[0]}, ${selectedItems[1]} (+${selectedItems.length - 2})`;
                }
              }

              return (
                <Pressable
                  key={cat.key}
                  onPress={() => openCategoryModal(cat)}
                  className={`flex-row items-center justify-between p-4 active:bg-zinc-800/70 ${
                    !isLast ? "border-b border-zinc-800/60" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: cat.iconBg }}
                    >
                      <IconComponent size={20} color={cat.iconColor} />
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-bold text-white tracking-wide">
                        {cat.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`text-xs mt-0.5 ${
                          hasSelection ? "text-zinc-300 font-medium" : "text-zinc-500 italic"
                        }`}
                      >
                        {summaryText}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {hasSelection && (
                      <View
                        className="rounded-full px-2.5 py-0.5"
                        style={{ backgroundColor: "rgba(255, 0, 127, 0.15)", borderWidth: 1, borderColor: "rgba(255, 0, 127, 0.4)" }}
                      >
                        <Text style={{ color: "#FF007F", fontSize: 11, fontWeight: "700" }}>
                          {selectedItems.length}
                        </Text>
                      </View>
                    )}
                    <ChevronRight size={18} color="#71717a" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="h-[1px] bg-zinc-900" />

        {/* VİBE RADAR GRAFİĞİ (Düz / Flat - Glow Olmadan) */}
        <View className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 items-center">
          <View className="flex-row items-center gap-1.5 mb-2">
            <Sparkles size={16} color="#c4b5fd" />
            <Text className="text-base font-black text-white">Vibe Radarım</Text>
          </View>
          <View className="py-2">
            <VibeRadarChart
              humor={user.personality_humor ?? 50}
              energy={user.personality_energy ?? 50}
              lifestyle={user.personality_lifestyle ?? 50}
              weekend={user.personality_weekend ?? 50}
              loveLanguage={user.personality_love_language ?? 50}
              firstStep={user.personality_first_step ?? 50}
              size={250}
              glow={false}
            />
          </View>
        </View>

        <View className="h-[1px] bg-zinc-900" />

        {/* Switches */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-sm text-zinc-300">Titreme Efekti</Text>
            <Switch
              value={user.vibration_enabled}
              onValueChange={(val) => void patch({ vibration_enabled: val })}
              trackColor={{ false: "#27272a", true: "#8b5cf6" }}
            />
          </View>

          <View className="flex-row items-center justify-between py-2">
            <Text className="text-sm text-zinc-300">Bildirimler</Text>
            <Switch
              value={user.notifications_enabled}
              onValueChange={(val) => void patch({ notifications_enabled: val })}
              trackColor={{ false: "#27272a", true: "#8b5cf6" }}
            />
          </View>

          <View className="flex-row items-center justify-between py-2">
            <Text className="text-sm text-zinc-300">Beni Haritada Göster</Text>
            <Switch
              value={user.show_on_map}
              onValueChange={(val) => void patch({ show_on_map: val })}
              trackColor={{ false: "#27272a", true: "#8b5cf6" }}
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={logout}
          className="mt-4 h-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 active:bg-rose-500/20"
        >
          <Text className="text-base font-bold text-rose-400">Çıkış Yap</Text>
        </Pressable>
      </ScrollView>

      {/* FULL-SCREEN MULTI-SELECT MODAL */}
      <Modal
        visible={activeCategory !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveCategory(null)}
      >
        {activeCategory ? (
          <SafeAreaView edges={["left", "right"]} style={{ flex: 1, backgroundColor: "#09090b" }}>
            {/* Modal Header */}
            <View
              style={{ paddingTop: Math.max(insets.top, 24) }}
              className="flex-row items-center justify-between px-5 pb-4 border-b border-zinc-900 bg-zinc-950"
            >
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => setActiveCategory(null)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-zinc-900 active:bg-zinc-800"
                >
                  <X size={20} color="#ffffff" />
                </Pressable>

                <View>
                  <Text className="text-lg font-black text-white">{activeCategory.title}</Text>
                  <Text className="text-xs text-zinc-400">
                    {tempSelections.length > 0
                      ? `${tempSelections.length} seçim yapıldı`
                      : "Seçim yapın (Çoklu seçim yapılabilir)"}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={saveModalSelections}
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: "#FF007F" }}
              >
                <Text className="text-xs font-bold text-white">Tamam</Text>
              </Pressable>
            </View>

            {/* Optional Search Bar if many options */}
            {activeCategory.options.length > 8 && (
              <View className="px-5 pt-3 pb-1">
                <View className="flex-row items-center rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 h-11 gap-2.5">
                  <Search size={16} color="#71717a" />
                  <TextInput
                    value={modalSearch}
                    onChangeText={setModalSearch}
                    placeholder="Seçeneklerde ara..."
                    placeholderTextColor="#71717a"
                    className="flex-1 text-white text-sm"
                  />
                  {modalSearch.length > 0 && (
                    <Pressable onPress={() => setModalSearch("")}>
                      <X size={16} color="#a1a1aa" />
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            {/* Options List */}
            <ScrollView
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 160,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
              showsVerticalScrollIndicator={false}
            >
              {filteredModalOptions.map((opt) => {
                const isSelected = tempSelections.includes(opt);

                return (
                  <Pressable
                    key={opt}
                    onPress={() => toggleModalOption(opt)}
                    style={{
                      backgroundColor: isSelected ? "#FF007F" : "#18181b",
                      borderColor: isSelected ? "#FF007F" : "#27272a",
                      borderWidth: 1.5,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      elevation: isSelected ? 4 : 0,
                    }}
                  >
                    {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                    <Text
                      style={{
                        color: isSelected ? "#ffffff" : "#d4d4d8",
                        fontWeight: isSelected ? "700" : "500",
                        fontSize: 14,
                      }}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}

              {filteredModalOptions.length === 0 && (
                <View className="w-full py-16 items-center">
                  <Text className="text-zinc-500 text-sm">Aramanızla eşleşen seçenek bulunamadı.</Text>
                </View>
              )}
            </ScrollView>

            {/* Sticky Bottom Save Button */}
            <View
              className="absolute bottom-0 left-0 right-0 px-5 pt-4 bg-zinc-950/95 border-t border-zinc-900"
              style={{
                elevation: 10,
                paddingBottom: Math.max(insets.bottom, 24) + 12,
              }}
            >
              <Pressable
                onPress={saveModalSelections}
                className="h-14 w-full items-center justify-center rounded-2xl active:opacity-90"
                style={{
                  backgroundColor: "#FF007F",
                  elevation: 6,
                  shadowColor: "#FF007F",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                }}
              >
                <Text className="text-base font-black text-white tracking-wide">
                  {tempSelections.length > 0
                    ? `Kaydet (${tempSelections.length} Seçim)`
                    : "Kaydet"}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        ) : null}
      </Modal>

      {/* Photo Management Modal */}
      <PhotoManagerModal
        visible={photosOpen}
        user={user}
        onClose={() => setPhotosOpen(false)}
        onUpdate={setUser}
      />
    </SafeAreaView>
  );
}

function PhotoManagerModal({
  visible,
  user,
  onClose,
  onUpdate,
}: {

  visible: boolean;
  user: SessionUser;
  onClose: () => void;
  onUpdate: (u: SessionUser) => void;
}) {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const loadPhotos = async () => {
    try {
      const phs = await apiGet<UserPhoto[]>(`/api/users/${user.id}/photos`);
      setPhotos(phs);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (visible) void loadPhotos();
  }, [visible, user.id]);

  const uploadPhotoSlot = async (slotIdx: number, existingId?: string) => {
    setLoading(true);
    try {
      const uploaded = await pickAndUploadPhoto();
      if (!uploaded) return;

      if (slotIdx === 0) {
        const next = await apiPatch<SessionUser>("/api/users/me", {
          avatar_url: uploaded.url,
        });
        onUpdate(next);
      }

      if (existingId) {
        await apiDelete(`/api/users/me/photos/${existingId}`);
      }
      await apiPost("/api/users/me/photos", {
        url: uploaded.url,
        public_id: uploaded.public_id,
        order_index: slotIdx,
      });
      void loadPhotos();
      const me = await apiGet<SessionUser>("/api/auth/me");
      onUpdate(me);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fotoğraf yüklenemedi.";
      Alert.alert("Hata", message.includes("izin") ? message : "Fotoğraf yüklenemedi. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  const slots = Array.from({ length: 9 }).map((_, i) => {
    const p = photos.find((ph) => ph.order_index === i);
    if (i === 0) return { url: p?.url || user.avatar_url, isMain: true, id: p?.id };
    return { url: p?.url, isMain: false, id: p?.id };
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-end">
        <View style={{ paddingBottom: Math.max(insets.bottom, 20) + 16 }}
          className="h-[80%] rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-5">
          <View className="flex-row items-center justify-between pb-4 border-b border-zinc-900">
            <View>
              <Text className="text-lg font-bold text-white">Fotoğrafların</Text>
              <Text className="text-[11px] text-zinc-500 mt-0.5">İlk kare kapak fotoğrafın olur</Text>
            </View>
            <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-zinc-900">
              <X size={18} color="#a1a1aa" />
            </Pressable>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2.5 pt-4 justify-center">
              {slots.map((s, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => void uploadPhotoSlot(idx, s.id)}
                  className={`h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border ${
                    idx === 0
                      ? "border-violet-500 bg-violet-950/20"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  {s.url ? (
                    <Image source={{ uri: s.url }} className="h-full w-full object-cover" />
                  ) : (
                    <View className="items-center">
                      <Plus size={20} color="#71717a" />
                      <Text className="text-[10px] text-zinc-500 mt-1">
                        {idx === 0 ? "Ana Foto" : `Slot ${idx + 1}`}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
