import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import {
  MapPin,
  Sparkles,
  Wine,
  Cigarette,
  MessageSquare,
  Compass,
  GraduationCap,
  PawPrint,
  Smile,
  ChevronDown,
  Globe,
  Ban,
  Flag,
  Check,
  X,
  Heart,
} from "lucide-react-native";
import { apiPost } from "../api";
import { VibeRadarChart } from "./VibeRadarChart";

export type ProfileDetailUser = {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  age: number | null;
  bio: string | null;
  photos?: string[] | null;
  first_photo?: string | null;
  languages?: string[] | null;
  looking_for?: string | null;
  personality_type?: string | null;
  alcohol_habit?: string | null;
  smoking_habit?: string | null;
  education_level?: string | null;
  family_plans?: string | null;
  communication_style?: string | null;
  pets?: string | null;
  zodiac_sign?: string | null;
  lifestyle_tags?: string[] | null;
  favorite_activities?: string[] | null;
  sports?: string[] | null;
  personality_humor?: number;
  personality_energy?: number;
  personality_lifestyle?: number;
  personality_first_step?: number;
  personality_love_language?: number;
  personality_weekend?: number;
  existing_vote?: "like" | "pass" | null;
};

const REPORT_REASONS = [
  "Uygunsuz profil fotoğrafı",
  "Sahte profil / Taklit hesap",
  "Uygunsuz takma ad veya biyografi",
  "Taciz veya rahatsız edici davranış",
  "Spam veya dolandırıcılık",
  "Diğer",
];

export type ProfileDetailViewProps = {
  user: ProfileDetailUser;
  onBlockSuccess?: () => void;
  onReportSuccess?: () => void;
  existingVote?: "like" | "pass" | null;
  onReVote?: (type: "like" | "pass") => void;
  contentPaddingBottom?: number;
};

export function ProfileDetailView({
  user,
  onBlockSuccess,
  onReportSuccess,
  existingVote,
  onReVote,
  contentPaddingBottom = 110,
}: ProfileDetailViewProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Block user handler
  const handleBlockUser = () => {
    Alert.alert(
      "Kullanıcıyı Engelle",
      `${user.name} engellensin mi? Birbirinizi artık hiçbir ekranda göremeyeceksiniz.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Engelle",
          style: "destructive",
          onPress: async () => {
            try {
              await apiPost("/api/blocks", { blocked_user_id: user.id });
              Alert.alert("Bilgi", `${user.name} engellendi.`);
              onBlockSuccess?.();
            } catch {
              Alert.alert("Hata", "Engelleme işlemi gerçekleştirilemedi.");
            }
          },
        },
      ]
    );
  };

  // Submit report handler
  const handleSubmitReport = async () => {
    setSubmittingReport(true);
    try {
      await apiPost("/api/reports", {
        target_user_id: user.id,
        reason: selectedReason,
      });
      setReportModalOpen(false);
      Alert.alert(
        "Bildiri Alındı",
        "Geri bildiriminiz için teşekkürler. Profil moderasyon ekibimizce incelenecektir."
      );
      onReportSuccess?.();
    } catch {
      Alert.alert("Hata", "Bildiri gönderilemedi.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const userPhotos =
    user.photos && user.photos.length > 0
      ? user.photos
      : user.first_photo
      ? [user.first_photo]
      : user.avatar_url
      ? [user.avatar_url]
      : ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"];

  const photo1 = userPhotos[0];
  const photo2 = userPhotos[1] || null;
  const photo3 = userPhotos[2] || null;

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: contentPaddingBottom, gap: 14 }}
        bounces={false}
      >
        {/* FİKRİN Mİ DEĞİŞTİ? UYARISI & YENİDEN OYLAMA ALANI (Eğer oy verilmişse) */}
        {existingVote && onReVote && (
          <View className="p-4 rounded-2xl border border-violet-500/50 bg-violet-950/30">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Sparkles size={16} color="#c4b5fd" />
              <Text className="text-sm font-black text-white">Fikrin mi değişti?</Text>
            </View>
            <Text className="text-xs text-zinc-300 leading-relaxed mb-3">
              Bu kullanıcıyı daha önce{" "}
              <Text className="font-bold text-violet-300">
                {existingVote === "like" ? "beğendin" : "pas geçtin"}
              </Text>
              . Fikrini değiştirmek için yeniden oy verebilirsin:
            </Text>
            <View className="flex-row items-center justify-center gap-5">
              <Pressable
                onPress={() => onReVote("pass")}
                className={`flex-1 h-11 flex-row items-center justify-center rounded-xl border ${
                  existingVote === "pass"
                    ? "border-rose-500 bg-rose-950/60"
                    : "border-zinc-800 bg-zinc-900 active:bg-rose-950/30"
                }`}
              >
                <X size={16} color="#f43f5e" strokeWidth={2.5} />
                <Text className="text-xs font-bold text-white ml-2">Pas Geç</Text>
              </Pressable>

              <Pressable
                onPress={() => onReVote("like")}
                className={`flex-1 h-11 flex-row items-center justify-center rounded-xl border ${
                  existingVote === "like"
                    ? "border-[#FF007F] bg-[#FF007F]/20"
                    : "border-zinc-800 bg-zinc-900 active:bg-pink-950/30"
                }`}
              >
                <Heart
                  size={16}
                  color="#FF007F"
                  fill={existingVote === "like" ? "#FF007F" : "none"}
                />
                <Text className="text-xs font-bold text-white ml-2">Beğen</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* 1. KULLANICININ 1. FOTOĞRAFI (Büyük / Tam Ekran) */}
        <View className="relative w-full h-[490px] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/60">
          <Image
            source={{ uri: photo1 }}
            className="h-full w-full object-cover"
            resizeMode="cover"
          />

          {/* Dark Gradient Bottom Overlay */}
          <View className="absolute inset-x-0 bottom-0 h-44 bg-zinc-950/85 justify-end p-5">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-3xl font-black text-white tracking-tight">
                {user.name}
              </Text>
              {user.age != null && (
                <Text className="text-2xl font-bold text-zinc-300">
                  {user.age}
                </Text>
              )}
            </View>

            <View className="flex-row items-center gap-1.5 mt-1.5">
              <MapPin size={16} color="#FF007F" />
              <Text className="text-sm font-semibold text-zinc-200">
                {user.city || "İstanbul, Kadıköy"}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-white/10">
              <Text className="text-[11px] text-zinc-400 font-medium">
                Profil detayları için aşağı kaydırın
              </Text>
              <ChevronDown size={14} color="#a1a1aa" />
            </View>
          </View>
        </View>

        {/* 2. BİLGİ BLOĞU 1 (Hakkında, Bildiği Diller, Alkol / Tütün, İletişim) */}
        <View className="rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-4 gap-3.5">
          {user.bio ? (
            <View className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Hakkında
              </Text>
              <Text className="text-sm leading-relaxed text-zinc-200">
                {user.bio}
              </Text>
            </View>
          ) : null}

          {/* Bildiği Diller */}
          {user.languages && user.languages.length > 0 && (
            <View>
              <View className="flex-row items-center gap-1.5 mb-2">
                <Globe size={14} color="#38bdf8" />
                <Text className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Bildiği Diller
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {user.languages.map((lang, idx) => (
                  <View
                    key={`lang-${idx}`}
                    className="flex-row items-center gap-1 rounded-full border border-sky-500/30 bg-sky-950/30 px-3 py-1"
                  >
                    <Text className="text-xs font-semibold text-sky-200">{lang}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Alışkanlıklar & İletişim */}
          {(user.alcohol_habit || user.smoking_habit || user.communication_style) && (
            <View className="pt-2 border-t border-zinc-800/60">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Alışkanlıklar & İletişim
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {user.alcohol_habit && (
                  <View className="flex-row items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5">
                    <Wine size={13} color="#6ee7b7" />
                    <Text className="text-xs font-semibold text-emerald-200">
                      Alkol: {user.alcohol_habit}
                    </Text>
                  </View>
                )}

                {user.smoking_habit && (
                  <View className="flex-row items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1.5">
                    <Cigarette size={13} color="#a1a1aa" />
                    <Text className="text-xs font-semibold text-zinc-300">
                      Tütün: {user.smoking_habit}
                    </Text>
                  </View>
                )}

                {user.communication_style && (
                  <View className="flex-row items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/30 px-3 py-1.5">
                    <MessageSquare size={13} color="#7dd3fc" />
                    <Text className="text-xs font-semibold text-sky-200">
                      {user.communication_style}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* 3. KULLANICININ 2. FOTOĞRAFI */}
        {photo2 && (
          <View className="w-full h-[430px] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/60">
            <Image
              source={{ uri: photo2 }}
              className="h-full w-full object-cover"
              resizeMode="cover"
            />
          </View>
        )}

        {/* 4. BİLGİ BLOĞU 2 (Aradığım Şey, MBTI, Eğitim, Burç, Evcil Hayvan, Yaşam Tarzı, Aktiviteler) */}
        <View className="rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-4 gap-3.5">
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Kişisel Bilgiler & Hedefler
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {user.looking_for && (
                <View className="flex-row items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/30 px-3 py-1.5">
                  <Compass size={13} color="#fcd34d" />
                  <Text className="text-xs font-semibold text-amber-200">
                    {user.looking_for}
                  </Text>
                </View>
              )}

              {user.personality_type && (
                <View className="flex-row items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-950/30 px-3 py-1.5">
                  <Sparkles size={13} color="#c4b5fd" />
                  <Text className="text-xs font-semibold text-violet-200">
                    {user.personality_type}
                  </Text>
                </View>
              )}

              {user.education_level && (
                <View className="flex-row items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/30 px-3 py-1.5">
                  <GraduationCap size={13} color="#a5b4fc" />
                  <Text className="text-xs font-semibold text-indigo-200">
                    {user.education_level}
                  </Text>
                </View>
              )}

              {user.zodiac_sign && (
                <View className="flex-row items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/30 px-3 py-1.5">
                  <Smile size={13} color="#f0abfc" />
                  <Text className="text-xs font-semibold text-fuchsia-200">
                    Burç: {user.zodiac_sign}
                  </Text>
                </View>
              )}

              {user.pets && (
                <View className="flex-row items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-950/30 px-3 py-1.5">
                  <PawPrint size={13} color="#fdba74" />
                  <Text className="text-xs font-semibold text-orange-200">
                    Evcil Hayvan: {user.pets}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Yaşam Tarzı Etiketleri */}
          {user.lifestyle_tags && user.lifestyle_tags.length > 0 && (
            <View className="pt-2 border-t border-zinc-800/60">
              <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Yaşam Tarzı
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {user.lifestyle_tags.map((tag, idx) => (
                  <View
                    key={`tag-${idx}`}
                    className="rounded-full border border-zinc-700/80 bg-zinc-800/70 px-3 py-1"
                  >
                    <Text className="text-xs font-medium text-zinc-200">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Aktiviteler & Sporlar */}
          {((user.favorite_activities && user.favorite_activities.length > 0) ||
            (user.sports && user.sports.length > 0)) && (
            <View className="pt-2 border-t border-zinc-800/60">
              <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Aktiviteler & Spor
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(user.favorite_activities || []).map((act, i) => (
                  <View
                    key={`act-${i}`}
                    className="rounded-full border border-rose-500/30 bg-rose-950/30 px-3 py-1"
                  >
                    <Text className="text-xs font-medium text-rose-200">{act}</Text>
                  </View>
                ))}
                {(user.sports || []).map((sp, i) => (
                  <View
                    key={`sp-${i}`}
                    className="rounded-full border border-teal-500/30 bg-teal-950/30 px-3 py-1"
                  >
                    <Text className="text-xs font-medium text-teal-200">{sp}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 5. KULLANICININ 3. FOTOĞRAFI (Varsa) */}
        {photo3 && (
          <View className="w-full h-[430px] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/60">
            <Image
              source={{ uri: photo3 }}
              className="h-full w-full object-cover"
              resizeMode="cover"
            />
          </View>
        )}

        {/* 6. EN ALTTA: VİBE RADAR GRAFİĞİ (Altıgen & Dışa Parlayan Glow) */}
        <View className="rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-4 items-center">
          <View className="flex-row items-center gap-1.5 mb-2">
            <Sparkles size={16} color="#FF007F" />
            <Text className="text-sm font-black text-white tracking-wide">Vibe Radarı</Text>
          </View>

          <View className="py-2">
            <VibeRadarChart
              humor={user.personality_humor ?? 50}
              energy={user.personality_energy ?? 50}
              lifestyle={user.personality_lifestyle ?? 50}
              weekend={user.personality_weekend ?? 50}
              loveLanguage={user.personality_love_language ?? 50}
              firstStep={user.personality_first_step ?? 50}
              size={260}
              glow={true}
            />
          </View>
        </View>

        {/* ENGELLEMEK VE BİLDİRİ BUTONLARI (Vibe Radarının Altında) */}
        <View className="flex-row items-center justify-center gap-3 pt-3 pb-2">
          <Pressable
            onPress={handleBlockUser}
            className="flex-1 flex-row items-center justify-center gap-2 h-12 rounded-2xl border border-zinc-800 bg-zinc-900/80 active:bg-rose-950/30"
          >
            <Ban size={16} color="#a1a1aa" />
            <Text className="text-xs font-bold text-zinc-300">Engellemek</Text>
          </Pressable>

          <Pressable
            onPress={() => setReportModalOpen(true)}
            className="flex-1 flex-row items-center justify-center gap-2 h-12 rounded-2xl border border-zinc-800 bg-zinc-900/80 active:bg-amber-950/30"
          >
            <Flag size={16} color="#f59e0b" />
            <Text className="text-xs font-bold text-amber-400">Bildiri</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* BİLDİRİ (REPORT) MODALI */}
      <Modal
        visible={reportModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalOpen(false)}
      >
        <Pressable
          onPress={() => setReportModalOpen(false)}
          className="flex-1 bg-black/75 justify-center items-center p-5"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            style={{ elevation: 12 }}
          >
            <View className="flex-row items-center justify-between pb-3 border-b border-zinc-900 mb-4">
              <Text className="text-base font-black text-white flex-1 pr-2">
                {user.name}'i bildirmek mi istiyorsun?
              </Text>
              <Pressable
                onPress={() => setReportModalOpen(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-zinc-900"
              >
                <X size={16} color="#a1a1aa" />
              </Pressable>
            </View>

            <Text className="text-xs text-zinc-400 mb-3">
              Lütfen şikayet nedeninizi seçin:
            </Text>

            <View className="gap-2 mb-6">
              {REPORT_REASONS.map((reason) => {
                const isSel = selectedReason === reason;
                return (
                  <Pressable
                    key={reason}
                    onPress={() => setSelectedReason(reason)}
                    className={`flex-row items-center justify-between p-3 rounded-xl border ${
                      isSel
                        ? "border-amber-500/70 bg-amber-950/25"
                        : "border-zinc-800/80 bg-zinc-900/60"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSel ? "text-amber-300" : "text-zinc-300"
                      }`}
                    >
                      {reason}
                    </Text>
                    {isSel && <Check size={16} color="#f59e0b" />}
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setReportModalOpen(false)}
                className="flex-1 h-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 active:bg-zinc-800"
              >
                <Text className="text-xs font-bold text-zinc-400">İptal</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmitReport}
                disabled={submittingReport}
                className="flex-1 h-12 items-center justify-center rounded-xl bg-amber-600 active:bg-amber-700"
              >
                {submittingReport ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-xs font-black text-white">Evet, bildir</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
