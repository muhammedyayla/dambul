import React, { useEffect, useRef, useState, useMemo } from "react";
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
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
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
  Heart,
  Ruler,
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
type LiveVibeSheet = "looking_for" | "languages" | "mood" | null;

const MOOD_OPTIONS = [
  { emoji: "🔥", label: "Alev Alev" },
  { emoji: "🙂", label: "Aptalca Hissediyorum" },
  { emoji: "💩", label: "Aptallık Yapıyorum" },
  { emoji: "🥵", label: "Ateşli Hissediyorum" },
  { emoji: "😍", label: "Aşktan Başım Dönüyor" },
  { emoji: "😎", label: "Aşırı Havalı" },
  { emoji: "🤒", label: "Berbat Hissediyorum" },
  { emoji: "😤", label: "Biraz Kızgınım" },
  { emoji: "🛸", label: "Bu Dünyadan Değil" },
  { emoji: "🥶", label: "Buz Gibi" },
  { emoji: "😴", label: "Dalmışım" },
  { emoji: "😭", label: "Dibe Vurdum" },
  { emoji: "⚠️", label: "Dikkat Et!" },
  { emoji: "💋", label: "Flört Modundayım" },
  { emoji: "🤧", label: "Formdan Düşmüşüm" },
] as const;

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
    maxSelections: 3,
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
  const scrollRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [height, setHeight] = useState("");
  const [photosOpen, setPhotosOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [heightOpen, setHeightOpen] = useState(false);
  const [liveVibeSheet, setLiveVibeSheet] = useState<LiveVibeSheet>(null);
  const [draftLanguages, setDraftLanguages] = useState<string[]>([]);
  const [savingVibe, setSavingVibe] = useState(false);
  const [basicsY, setBasicsY] = useState(0);
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
    try {
      const next = await patch({
        name: name.trim(),
        city: city.trim() || null,
        bio: bio.trim() || null,
        height: Number.isNaN(h) ? null : h,
      });
      if (next) Alert.alert("Başarılı", "Temel bilgileriniz kaydedildi.");
    } finally {
      setSaving(false);
    }
  };

  const saveGender = async (gender: "female" | "male") => {
    const next = await patch({ gender });
    if (next) setGenderOpen(false);
  };

  const openLanguagesSheet = () => {
    setDraftLanguages([...(user?.languages ?? [])].slice(0, 3));
    setLiveVibeSheet("languages");
  };

  const toggleLanguage = (language: string) => {
    setDraftLanguages((current) => {
      if (current.includes(language)) return current.filter((item) => item !== language);
      if (current.length >= 3) {
        Alert.alert("En fazla 3 dil", "Profilinizde en fazla üç dil seçebilirsiniz.");
        return current;
      }
      return [...current, language];
    });
  };

  const saveLanguages = async () => {
    setSavingVibe(true);
    try {
      const next = await patch({ languages: draftLanguages });
      if (next) setLiveVibeSheet(null);
    } finally {
      setSavingVibe(false);
    }
  };

  const selectLookingFor = async (option: string) => {
    setSavingVibe(true);
    try {
      const next = await patch({ looking_for: option });
      if (next) setLiveVibeSheet(null);
    } finally {
      setSavingVibe(false);
    }
  };

  const selectMood = async (mood: (typeof MOOD_OPTIONS)[number]) => {
    setSavingVibe(true);
    try {
      const next = await patch({ live_vibe: `${mood.emoji} ${mood.label}` });
      if (next) setLiveVibeSheet(null);
    } finally {
      setSavingVibe(false);
    }
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

  const orbitStageWidth = Math.min(300, screenWidth - 40);
  const avatarLeft = (orbitStageWidth - 160) / 2;
  const leftOrbit = Math.max(0, orbitStageWidth * 0.07);
  const rightOrbit = orbitStageWidth - 44 - leftOrbit;
  const firstLanguageFlag = user?.languages?.[0]?.split(" ")[0];
  const lookingForEmoji = user?.looking_for?.split(" ")[0];
  const moodEmoji = user?.live_vibe?.split(" ")[0];

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

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20, paddingBottom: 80, gap: 24 }}
      >
        {/* Profile photo with distinct orbit actions */}
        <View className="items-center">
          <View style={{ width: orbitStageWidth, height: 218, position: "relative" }}>
            <View
              className="absolute items-center justify-center overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-900"
              style={{ width: 160, height: 160, left: avatarLeft, top: 32, elevation: 8 }}
            >
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} className="h-full w-full object-cover" />
              ) : (
                <Text className="text-4xl font-bold text-zinc-500">
                  {user.name ? user.name.slice(0, 1) : "D"}
                </Text>
              )}
            </View>

            {[
              {
                key: "looking_for",
                selected: lookingForEmoji,
                style: { left: leftOrbit, top: 20 },
                onPress: () => setLiveVibeSheet("looking_for"),
              },
              {
                key: "languages",
                selected: firstLanguageFlag,
                style: { left: (orbitStageWidth - 44) / 2, top: 0 },
                onPress: openLanguagesSheet,
              },
              {
                key: "mood",
                selected: moodEmoji,
                style: { left: rightOrbit, top: 20 },
                onPress: () => setLiveVibeSheet("mood"),
              },
              {
                key: "edit",
                selected: null,
                style: { left: leftOrbit, top: 150 },
                onPress: () => scrollRef.current?.scrollTo({ y: Math.max(0, basicsY - 20), animated: true }),
              },
              {
                key: "photos",
                selected: null,
                style: { left: rightOrbit, top: 150 },
                onPress: () => setPhotosOpen(true),
              },
            ].map((button) => (
              <Pressable
                key={button.key}
                accessibilityRole="button"
                accessibilityLabel={
                  button.key === "looking_for"
                    ? "Burada ne arıyorsun"
                    : button.key === "languages"
                      ? "Dillerini seç"
                      : button.key === "mood"
                        ? "Bugün modun nasıl"
                        : button.key === "edit"
                          ? "Temel bilgileri düzenle"
                          : "Profil fotoğraflarını yönet"
                }
                onPress={button.onPress}
                className={`absolute h-11 w-11 items-center justify-center rounded-full border ${
                  button.selected
                    ? "border-pink-400 bg-pink-600"
                    : "border-zinc-600 bg-zinc-900"
                }`}
                style={[button.style, { zIndex: 2, elevation: 8 }]}
              >
                {button.selected ? (
                  <Text numberOfLines={1} style={{ color: "#ffffff", fontSize: 21 }}>
                    {button.selected}
                  </Text>
                ) : button.key === "edit" ? (
                  <Pencil size={18} color="#ffffff" />
                ) : button.key === "photos" ? (
                  <Camera size={19} color="#ffffff" />
                ) : (
                  <Plus size={21} color="#ffffff" strokeWidth={2.5} />
                )}
              </Pressable>
            ))}
          </View>

          <Text className="text-xl font-black text-white mt-3">{user.name}</Text>
        </View>

        {/* Basic Fields */}
        <View className="gap-4" onLayout={(event) => setBasicsY(event.nativeEvent.layout.y)}>
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
              Benim geldiğim yer
            </Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Şehir, ilçe veya semt yazın"
              placeholderTextColor="#71717a"
              className="h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white"
            />
            <Text className="text-[11px] text-zinc-500 mt-1">
              İstediğiniz şehir, ilçe veya semti yazıp kaydedebilirsiniz.
            </Text>
          </View>

          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Cinsiyet
            </Text>
            <Pressable
              onPress={() => setGenderOpen(true)}
              className="h-12 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4"
            >
              <Text className={user.gender ? "text-white" : "text-zinc-500"}>
                {user.gender === "female"
                  ? "Kadın"
                  : user.gender === "male"
                    ? "Erkek"
                    : "Seçin"}
              </Text>
              <ChevronRight size={18} color="#71717a" />
            </Pressable>
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
            <Pressable
              onPress={() => setHeightOpen(true)}
              className="h-12 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4"
            >
              <Text className="text-white">{height ? `${height} cm` : "Boyunu paylaş"}</Text>
              <ChevronRight size={18} color="#71717a" />
            </Pressable>
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
        <View className="gap-5 rounded-[24px] border border-zinc-800 bg-[#18181b] p-5">
          <Text className="text-xl font-bold text-white">Tercihler</Text>

          <View>
            <Text className="mb-3 text-base font-bold text-white">
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
                  className={`flex-1 h-[54px] items-center justify-center rounded-2xl border ${
                    user.pref_gender === item.val
                      ? "border-pink-400 bg-pink-600"
                      : "border-zinc-700 bg-zinc-900"
                  }`}
                  style={
                    user.pref_gender === item.val
                      ? { shadowColor: "#ec4899", shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 }
                      : undefined
                  }
                >
                  <Text
                    className={`text-xs font-semibold ${
                      user.pref_gender === item.val ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <PreferenceRange
            label="Yaş aralığı"
            valueLabel={`${user.pref_age_min} - ${user.pref_age_max}`}
            values={[user.pref_age_min, user.pref_age_max]}
            min={18}
            max={100}
            labels={["18", "100"]}
            onCommit={(values) =>
              void patch({ pref_age_min: values[0], pref_age_max: values[1] })
            }
          />

          <PreferenceRange
            label="Mesafe"
            valueLabel={`${user.pref_distance_km >= 500 ? "max" : user.pref_distance_km === 5 ? "min" : `${user.pref_distance_km} km`}`}
            values={[user.pref_distance_km]}
            min={5}
            max={500}
            snapPoints={[5, 25, 50, 100, 500]}
            labels={["min", "25 km", "50 km", "100 km", "max"]}
            onCommit={(values) => void patch({ pref_distance_km: values[0] })}
          />

          <PreferenceRange
            label="Boy"
            valueLabel={`${Math.min(209, user.pref_height_min)} - ${Math.min(210, user.pref_height_max)} cm`}
            values={[Math.min(209, user.pref_height_min), Math.min(210, user.pref_height_max)]}
            min={130}
            max={210}
            labels={["130 cm", "210 cm"]}
            onCommit={(values) =>
              void patch({ pref_height_min: values[0], pref_height_max: values[1] })
            }
          />
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

      <Modal
        visible={heightOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setHeightOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 20) + 16 }}
            className="rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-5"
          >
            <View className="flex-row items-start justify-between">
              <View>
                <View className="mb-2 flex-row items-center gap-2">
                  <Ruler size={17} color="#ec4899" />
                  <Text className="text-xs font-bold tracking-[1.5px] text-pink-400">BASICS</Text>
                </View>
                <Text className="text-2xl font-extrabold text-white">Boy</Text>
                <Text className="mt-1 text-sm text-zinc-400">Boyunu paylaş</Text>
              </View>
              <Pressable
                accessibilityLabel="Boy seçimini kapat"
                onPress={() => setHeightOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-zinc-900"
              >
                <ChevronDown size={19} color="#ffffff" />
              </Pressable>
            </View>
            <Text className="mt-8 text-center text-[32px] font-extrabold text-white">
              {height || "175"} cm
            </Text>
            <DraggableSlider
              values={[Number(height) || 175]}
              min={130}
              max={210}
              onCommit={(values) => {
                const value = values[0];
                setHeight(String(value));
                void patch({ height: value });
              }}
            />
            <View className="mt-6 items-center">
              <View className="flex-row items-center rounded-full border border-zinc-700 bg-zinc-900 p-1">
                <View className="rounded-full bg-pink-500 px-5 py-2">
                  <Text className="text-sm font-bold text-white">cm</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={liveVibeSheet !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setLiveVibeSheet(null)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View
            style={{ maxHeight: "88%", paddingBottom: Math.max(insets.bottom, 16) + 12 }}
            className="rounded-t-[32px] border-t border-zinc-800 bg-zinc-950 px-5 pt-6"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <View className="mb-2 flex-row items-center gap-2">
                  {liveVibeSheet === "looking_for" ? (
                    <Heart size={17} color="#ffffff" />
                  ) : liveVibeSheet === "languages" ? (
                    <Globe size={18} color="#ffffff" />
                  ) : (
                    <Smile size={18} color="#ffffff" />
                  )}
                  <Text className="text-xs font-black tracking-[1.5px] text-pink-400">
                    LIVE VIBE
                  </Text>
                </View>
                <Text className="text-2xl font-extrabold text-white">
                  {liveVibeSheet === "looking_for"
                    ? "Burada ne arıyorsun"
                    : liveVibeSheet === "languages"
                      ? "Dilinizi seçiniz"
                      : "Bugün modun nasıl"}
                </Text>
                {liveVibeSheet === "languages" ? (
                  <Text className="mt-1 text-sm font-semibold text-zinc-500">
                    {draftLanguages.length}/3
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityLabel="Kapat"
                onPress={() => setLiveVibeSheet(null)}
                className="h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900"
              >
                <ChevronDown size={19} color="#ffffff" />
              </Pressable>
            </View>

            {liveVibeSheet === "looking_for" ? (
              <ScrollView
                contentContainerStyle={{ paddingTop: 22, paddingBottom: 16, gap: 10 }}
                showsVerticalScrollIndicator={false}
              >
                <View className="flex-row flex-wrap justify-between gap-y-3">
                  {LOOKING_FOR_OPTIONS.map((option) => {
                    const isSelected = user.looking_for === option;
                    return (
                      <Pressable
                        key={option}
                        disabled={savingVibe}
                        onPress={() => void selectLookingFor(option)}
                        style={{ width: (screenWidth - 60) / 2, minHeight: 54 }}
                        className={`flex-row items-center justify-center rounded-full border px-3 ${
                          isSelected
                            ? "border-pink-500 bg-pink-950/70"
                            : "border-zinc-800 bg-zinc-900"
                        }`}
                      >
                        <Text className="text-center text-sm font-semibold text-white">
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            ) : liveVibeSheet === "languages" ? (
              <>
                <ScrollView
                  contentContainerStyle={{ paddingTop: 18, paddingBottom: 18, gap: 10 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View className="flex-row flex-wrap gap-2.5">
                    {LANGUAGES_OPTIONS.map((language) => {
                      const [flag, ...nameParts] = language.split(" ");
                      const isSelected = draftLanguages.includes(language);
                      return (
                        <Pressable
                          key={language}
                          onPress={() => toggleLanguage(language)}
                          className={`flex-row items-center gap-2 rounded-full border px-3 py-2.5 ${
                            isSelected
                              ? "border-pink-500 bg-pink-950/70"
                              : "border-zinc-800 bg-zinc-900"
                          }`}
                        >
                          <View className="h-7 w-7 items-center justify-center rounded-full bg-zinc-800">
                            <Text style={{ fontSize: 16 }}>{flag}</Text>
                          </View>
                          <Text className="text-sm font-semibold text-white">
                            {nameParts.join(" ")}
                          </Text>
                          {isSelected ? <Check size={15} color="#f9a8d4" /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
                <Pressable
                  disabled={savingVibe}
                  onPress={() => void saveLanguages()}
                  className="mb-3 h-12 items-center justify-center rounded-2xl bg-pink-600 active:bg-pink-700"
                >
                  {savingVibe ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="font-bold text-white">Kaydet</Text>
                  )}
                </Pressable>
              </>
            ) : liveVibeSheet === "mood" ? (
              <ScrollView
                contentContainerStyle={{ paddingTop: 18, paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                <View className="flex-row flex-wrap gap-2">
                  {MOOD_OPTIONS.map((mood) => {
                    const value = `${mood.emoji} ${mood.label}`;
                    const isSelected = user.live_vibe === value;
                    return (
                      <Pressable
                        key={mood.label}
                        disabled={savingVibe}
                        onPress={() => void selectMood(mood)}
                        style={{ width: (screenWidth - 56) / 3, minHeight: 116 }}
                        className={`items-center justify-between rounded-[18px] border px-2.5 py-3 ${
                          isSelected
                            ? "border-pink-500 bg-pink-950/60"
                            : "border-zinc-800 bg-zinc-900"
                        }`}
                      >
                        <Text
                          numberOfLines={2}
                          className="min-h-9 text-center text-[11px] font-semibold leading-4 text-zinc-200"
                        >
                          {mood.label}
                        </Text>
                        <Text style={{ fontSize: 36, lineHeight: 44 }}>{mood.emoji}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={genderOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setGenderOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 20) + 16 }}
            className="rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-5"
          >
            <View className="flex-row items-center justify-between pb-4">
              <View>
                <Text className="text-lg font-bold text-white">Cinsiyetim</Text>
                <Text className="text-xs text-zinc-500 mt-1">Profilinizde görünecek</Text>
              </View>
              <Pressable
                onPress={() => setGenderOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-zinc-900"
              >
                <X size={18} color="#a1a1aa" />
              </Pressable>
            </View>
            {([
              { label: "Kadın", value: "female" },
              { label: "Erkek", value: "male" },
            ] as const).map((option) => (
              <Pressable
                key={option.value}
                onPress={() => void saveGender(option.value)}
                className={`mb-2 h-12 flex-row items-center justify-between rounded-xl border px-4 ${
                  user.gender === option.value
                    ? "border-violet-500 bg-violet-600/20"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    user.gender === option.value ? "text-violet-300" : "text-zinc-300"
                  }`}
                >
                  {option.label}
                </Text>
                {user.gender === option.value ? <Check size={18} color="#c4b5fd" /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PreferenceRange({
  label,
  valueLabel,
  values,
  min,
  max,
  labels,
  snapPoints,
  onCommit,
}: {
  label: string;
  valueLabel: string;
  values: number[];
  min: number;
  max: number;
  labels: string[];
  snapPoints?: number[];
  onCommit: (values: number[]) => void;
}) {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-zinc-400">{label}</Text>
        <Text className="text-sm font-bold text-pink-300">{valueLabel}</Text>
      </View>
      <DraggableSlider
        values={values}
        min={min}
        max={max}
        labels={labels}
        snapPoints={snapPoints}
        onCommit={onCommit}
      />
    </View>
  );
}

function DraggableSlider({
  values,
  min,
  max,
  labels = [],
  snapPoints,
  onCommit,
}: {
  values: number[];
  min: number;
  max: number;
  labels?: string[];
  snapPoints?: number[];
  onCommit: (values: number[]) => void;
}) {
  const [draftValues, setDraftValues] = useState(values);
  const [sliderWidth, setSliderWidth] = useState(0);
  const widthRef = useRef(0);
  const valuesRef = useRef(values);
  const activeThumbRef = useRef(0);
  const configRef = useRef({ min, max, snapPoints, onCommit });
  configRef.current = { min, max, snapPoints, onCommit };
  valuesRef.current = draftValues;

  useEffect(() => {
    const normalized = values.map((value) => Math.max(min, Math.min(max, value)));
    valuesRef.current = normalized;
    setDraftValues(normalized);
  }, [values.join(","), min, max]);

  const updateFromX = (locationX: number) => {
    const { min: lowerBound, max: upperBound, snapPoints: stops } = configRef.current;
    const usableWidth = Math.max(widthRef.current - 28, 1);
    const ratio = Math.max(0, Math.min(1, (locationX - 14) / usableWidth));
    let nextValue: number;

    if (stops?.length) {
      const allowedStops = stops.filter((stop) => {
        if (valuesRef.current.length === 1) return true;
        const other = valuesRef.current[activeThumbRef.current === 0 ? 1 : 0];
        return activeThumbRef.current === 0 ? stop < other : stop > other;
      });
      const stopIndex = Math.round(ratio * (stops.length - 1));
      const suggestedStop = stops[stopIndex];
      nextValue =
        allowedStops.find((stop) => stop === suggestedStop) ??
        allowedStops.reduce(
          (closest, stop) =>
            Math.abs(stop - suggestedStop) < Math.abs(closest - suggestedStop) ? stop : closest,
          allowedStops[0] ?? stops[0]
        );
    } else {
      const rawValue = lowerBound + ratio * (upperBound - lowerBound);
      nextValue = Math.round(rawValue);
      if (valuesRef.current.length > 1) {
        const other = valuesRef.current[activeThumbRef.current === 0 ? 1 : 0];
        nextValue =
          activeThumbRef.current === 0
            ? Math.min(nextValue, other - 1)
            : Math.max(nextValue, other + 1);
      }
      nextValue = Math.max(lowerBound, Math.min(upperBound, nextValue));
    }

    const nextValues = [...valuesRef.current];
    nextValues[activeThumbRef.current] = nextValue;
    valuesRef.current = nextValues;
    setDraftValues(nextValues);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        const currentValues = valuesRef.current;
        const { min: lowerBound, max: upperBound, snapPoints: stops } = configRef.current;
        const usableWidth = Math.max(widthRef.current - 28, 1);
        const x = Math.max(0, Math.min(1, (event.nativeEvent.locationX - 14) / usableWidth));
        const touchedValue =
          stops?.length
            ? stops[Math.round(x * (stops.length - 1))]
            : lowerBound + x * (upperBound - lowerBound);
        activeThumbRef.current =
          currentValues.length === 1 ||
          Math.abs(currentValues[0] - touchedValue) <= Math.abs(currentValues[1] - touchedValue)
            ? 0
            : 1;
        updateFromX(event.nativeEvent.locationX);
      },
      onPanResponderMove: (event) => updateFromX(event.nativeEvent.locationX),
      onPanResponderRelease: () => configRef.current.onCommit(valuesRef.current),
      onPanResponderTerminate: () => configRef.current.onCommit(valuesRef.current),
    })
  ).current;

  const positions = draftValues.map((value) => {
    const snapIndex = snapPoints?.indexOf(value) ?? -1;
    const ratio =
      snapPoints?.length && snapIndex >= 0
        ? snapIndex / Math.max(snapPoints.length - 1, 1)
        : (value - min) / Math.max(max - min, 1);
    return Math.max(0, Math.min(100, ratio * 100));
  });
  const usableWidth = Math.max(sliderWidth - 28, 0);
  const thumbPositions = positions.map((position) => 14 + (usableWidth * position) / 100);
  const trackStart = positions.length > 1 ? thumbPositions[0] : 14;
  const trackEnd = positions.length > 1 ? thumbPositions[1] : thumbPositions[0];

  return (
    <View>
      <View
        {...responder.panHandlers}
        onLayout={(event) => {
          widthRef.current = event.nativeEvent.layout.width;
          setSliderWidth(event.nativeEvent.layout.width);
        }}
        accessibilityRole="adjustable"
        style={{ height: 44, justifyContent: "center" }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: 19,
            height: 6,
            borderRadius: 99,
            backgroundColor: "#4a153b",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: trackStart,
            width: Math.max(0, trackEnd - trackStart),
            top: 19,
            height: 6,
            borderRadius: 99,
            backgroundColor: "#ec4899",
          }}
        />
        {snapPoints?.map((stop, index) => (
          <View
            key={stop}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 14 + (usableWidth * index) / Math.max(snapPoints.length - 1, 1),
              top: 17,
              width: 10,
              height: 10,
              marginLeft: -5,
              borderRadius: 5,
              backgroundColor: "#d4d4d8",
            }}
          />
        ))}
        {positions.map((position, index) => (
          <View
            key={index}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: thumbPositions[index],
              top: 8,
              width: 28,
              height: 28,
              marginLeft: -14,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: "#ffffff",
              backgroundColor: "#ec4899",
              elevation: 4,
            }}
          />
        ))}
      </View>
      {labels.length > 0 ? (
        <View className="flex-row items-center justify-between px-0.5">
          {labels.map((label, index) => (
            <Text key={`${label}-${index}`} className="text-[10px] font-medium text-zinc-500">
              {label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
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
  const { width: windowWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const gridWidth = Math.min(windowWidth - 40, 460);
  const gap = 10;
  const cell = (gridWidth - gap * 2) / 3;

  const loadPhotos = async () => {
    try {
      const phs = await apiGet<UserPhoto[]>(`/api/users/${user.id}/photos`);
      setPhotos(phs);
    } catch (error) {
      Alert.alert(
        "Hata",
        error instanceof Error ? error.message : "Fotoğraflar yüklenemedi."
      );
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

  const renderSlot = (index: number, width: number, height: number, isMain = false) => {
    const slot = slots[index];
    if (!slot) return null;
    return (
      <Pressable
        key={index}
        disabled={loading}
        onPress={() => void uploadPhotoSlot(index, slot.id)}
        style={{ width, height }}
        className="relative overflow-hidden rounded-[18px] border border-zinc-800 bg-[#050507]"
      >
        {slot.url ? (
          <Image source={{ uri: slot.url }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Plus size={26} color="#ffffff" />
            {!isMain ? (
              <Text className="mt-1 text-[10px] font-semibold text-zinc-500">
                Fotoğraf ekle
              </Text>
            ) : null}
          </View>
        )}
        {isMain ? (
          <View className="absolute left-0 right-0 top-3 items-center">
            <View className="rounded-full bg-black/65 px-3 py-1.5">
              <Text className="text-xs font-bold text-white">Ana fotoğraf</Text>
            </View>
          </View>
        ) : null}
        <View className="absolute bottom-2 right-2 h-9 w-9 items-center justify-center rounded-full bg-black/75">
          <Camera size={16} color="#ffffff" />
          <View className="absolute -right-0.5 -top-0.5 h-4 w-4 items-center justify-center rounded-full bg-pink-500">
            <Plus size={10} color="#ffffff" strokeWidth={3} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/70">
        <View
          style={{ height: "88%", paddingBottom: Math.max(insets.bottom, 16) + 12 }}
          className="rounded-t-3xl border-t border-zinc-800 bg-zinc-950 px-5 pt-5"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Camera size={16} color="#ec4899" />
              <Text className="text-xs font-bold tracking-[1.5px] text-pink-400">PROFILE</Text>
            </View>
            <Pressable
              accessibilityLabel="Fotoğrafları kapat"
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-zinc-900"
            >
              <ChevronDown size={19} color="#ffffff" />
            </Pressable>
          </View>
          <Text className="mt-4 text-2xl font-extrabold text-white">Profil fotoğrafları</Text>
          <Text className="mt-1 text-sm leading-5 text-zinc-400">
            Diğerlerinin gerçek seni görmesi için bir profil fotoğrafı yükle.
          </Text>

          <ScrollView
            contentContainerStyle={{ alignItems: "center", paddingTop: 18, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View className="absolute z-10 h-full w-full items-center justify-center bg-black/30">
                <ActivityIndicator size="large" color="#ec4899" />
              </View>
            ) : null}
            <View style={{ width: gridWidth, gap }}>
              <View style={{ flexDirection: "row", gap }}>
                {renderSlot(0, cell * 2 + gap, cell * 2 + gap, true)}
                <View style={{ gap }}>
                  {renderSlot(1, cell, cell)}
                  {renderSlot(2, cell, cell)}
                </View>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
                {slots.slice(3).map((_, offset) => renderSlot(offset + 3, cell, cell))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
