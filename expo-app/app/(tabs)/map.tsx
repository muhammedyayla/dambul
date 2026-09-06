import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import {
  MapPin,
  Search,
  X,
  ChevronRight,
  Navigation,
  Globe,
  Building2,
  ChevronDown,
  Crosshair,
  Dices,
  CalendarPlus,
  Check,
  Sparkles,
  Grid2X2,
  Map as MapIcon,
  Hand,
  Plus,
  UserCheck,
} from "lucide-react-native";
import { apiGet, apiPost } from "../../src/api";
import type { SessionUser } from "../../src/types";
import { formatRelativeTr } from "../../src/lib/time";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2;

type MapUser = {
  id: string;
  name: string;
  avatar_url: string | null;
  lat: number;
  lng: number;
  city?: string | null;
  age?: number | null;
  gender?: string | null;
};

type VibePostItem = {
  id: string;
  user_id: string;
  title: string;
  location_tag: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_city: string | null;
};

type LocationOption = {
  id: string;
  title: string;
  subtitle: string;
  category: "district" | "city" | "world";
  lat: number;
  lng: number;
  delta: number;
};

// PITCH DARK MINIMAL MAP STYLE (Hides roads, labels, poi, borders for starry user circles)
const PITCH_DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#09090b" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.stroke", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.country", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", stylers: [{ visibility: "off" }] },
  { featureType: "road.local", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", stylers: [{ color: "#040405" }] },
];

const POPULAR_LOCATIONS: LocationOption[] = [
  // İstanbul Semtleri & İlçeleri
  { id: "ist-kadikoy", title: "Kadıköy", subtitle: "İstanbul", category: "district", lat: 40.9927, lng: 29.0277, delta: 0.04 },
  { id: "ist-moda", title: "Moda", subtitle: "Kadıköy, İstanbul", category: "district", lat: 40.9835, lng: 29.0270, delta: 0.025 },
  { id: "ist-besiktas", title: "Beşiktaş", subtitle: "İstanbul", category: "district", lat: 41.0428, lng: 29.0077, delta: 0.04 },
  { id: "ist-bebek", title: "Bebek", subtitle: "Beşiktaş, İstanbul", category: "district", lat: 41.0772, lng: 29.0435, delta: 0.025 },
  { id: "ist-sisli", title: "Şişli", subtitle: "İstanbul", category: "district", lat: 41.0602, lng: 28.9877, delta: 0.04 },
  { id: "ist-nisantasi", title: "Nişantaşı", subtitle: "Şişli, İstanbul", category: "district", lat: 41.0520, lng: 28.9920, delta: 0.025 },
  { id: "ist-beyoglu", title: "Beyoğlu / Taksim", subtitle: "İstanbul", category: "district", lat: 41.0369, lng: 28.9774, delta: 0.03 },
  { id: "ist-karakoy", title: "Karaköy", subtitle: "Beyoğlu, İstanbul", category: "district", lat: 41.0244, lng: 28.9760, delta: 0.025 },
  { id: "ist-uskudar", title: "Üsküdar", subtitle: "İstanbul", category: "district", lat: 41.0264, lng: 29.0157, delta: 0.04 },
  { id: "ist-sariyer", title: "Sarıyer", subtitle: "İstanbul", category: "district", lat: 41.1667, lng: 29.0500, delta: 0.06 },
  { id: "ist-umraniye", title: "Ümraniye", subtitle: "İstanbul", category: "district", lat: 41.0256, lng: 29.0963, delta: 0.05 },
  { id: "ist-atasehir", title: "Ataşehir", subtitle: "İstanbul", category: "district", lat: 40.9847, lng: 29.1067, delta: 0.05 },
  { id: "ist-bakirkoy", title: "Bakırköy", subtitle: "İstanbul", category: "district", lat: 40.9780, lng: 28.8744, delta: 0.05 },
  { id: "ist-florya", title: "Florya", subtitle: "Bakırköy, İstanbul", category: "district", lat: 40.9723, lng: 28.7981, delta: 0.03 },
  { id: "ist-beylikduzu", title: "Beylikdüzü", subtitle: "İstanbul", category: "district", lat: 41.0028, lng: 28.6419, delta: 0.05 },
  { id: "ist-maltepe", title: "Maltepe", subtitle: "İstanbul", category: "district", lat: 40.9328, lng: 29.1309, delta: 0.05 },

  // Türkiye Büyük Şehirleri
  { id: "city-ist", title: "İstanbul", subtitle: "Marmara, Türkiye", category: "city", lat: 41.0082, lng: 28.9784, delta: 0.12 },
  { id: "city-ank", title: "Ankara (Çankaya)", subtitle: "İç Anadolu, Türkiye", category: "city", lat: 39.9208, lng: 32.8541, delta: 0.08 },
  { id: "city-izm", title: "İzmir (Alsancak)", subtitle: "Ege, Türkiye", category: "city", lat: 38.4237, lng: 27.1428, delta: 0.08 },
  { id: "city-ant", title: "Antalya (Muratpaşa)", subtitle: "Akdeniz, Türkiye", category: "city", lat: 36.8841, lng: 30.7056, delta: 0.08 },
  { id: "city-bodrum", title: "Bodrum", subtitle: "Muğla, Türkiye", category: "city", lat: 37.0344, lng: 27.4305, delta: 0.06 },
  { id: "city-fethiye", title: "Fethiye", subtitle: "Muğla, Türkiye", category: "city", lat: 36.6217, lng: 29.1164, delta: 0.06 },
  { id: "city-bur", title: "Bursa (Nilüfer)", subtitle: "Marmara, Türkiye", category: "city", lat: 40.1885, lng: 29.0610, delta: 0.08 },
  { id: "city-esk", title: "Eskişehir (Tepebaşı)", subtitle: "İç Anadolu, Türkiye", category: "city", lat: 39.7767, lng: 30.5206, delta: 0.06 },
  { id: "city-can", title: "Çanakkale", subtitle: "Marmara, Türkiye", category: "city", lat: 40.1553, lng: 26.4142, delta: 0.07 },
  { id: "city-tra", title: "Trabzon", subtitle: "Karadeniz, Türkiye", category: "city", lat: 41.0027, lng: 39.7168, delta: 0.07 },
  { id: "city-gzt", title: "Gaziantep", subtitle: "Güneydoğu Anadolu, Türkiye", category: "city", lat: 37.0662, lng: 37.3833, delta: 0.08 },
  { id: "city-ada", title: "Adana", subtitle: "Akdeniz, Türkiye", category: "city", lat: 36.9914, lng: 35.3308, delta: 0.08 },

  // Popüler Dünya Şehirleri
  { id: "world-berlin", title: "Berlin", subtitle: "Almanya", category: "world", lat: 52.5200, lng: 13.4050, delta: 0.10 },
  { id: "world-london", title: "Londra", subtitle: "Birleşik Krallık", category: "world", lat: 51.5074, lng: -0.1278, delta: 0.10 },
  { id: "world-paris", title: "Paris", subtitle: "Fransa", category: "world", lat: 48.8566, lng: 2.3522, delta: 0.10 },
  { id: "world-rome", title: "Roma", subtitle: "İtalya", category: "world", lat: 41.9028, lng: 12.4964, delta: 0.10 },
  { id: "world-ams", title: "Amsterdam", subtitle: "Hollanda", category: "world", lat: 52.3676, lng: 4.9041, delta: 0.08 },
  { id: "world-nyc", title: "New York", subtitle: "ABD", category: "world", lat: 40.7128, lng: -74.0060, delta: 0.10 },
  { id: "world-tokyo", title: "Tokyo", subtitle: "Japonya", category: "world", lat: 35.6762, lng: 139.6503, delta: 0.10 },
];

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [user, setUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<MapUser[]>([]);
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");

  // Wave (El Sallama) state
  const [wavedUsers, setWavedUsers] = useState<Record<string, boolean>>({});
  const [waveFeedback, setWaveFeedback] = useState<string | null>(null);

  // Search Modal state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "district" | "city" | "world">("all");
  const [selectedLocationLabel, setSelectedLocationLabel] = useState<string | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<{
    latitude: number;
    longitude: number;
    title: string;
  } | null>(null);

  // Vibe List Modal state (opened via calendar icon)
  const [vibeListOpen, setVibeListOpen] = useState(false);
  const [vibePosts, setVibePosts] = useState<VibePostItem[]>([]);
  const [loadingVibes, setLoadingVibes] = useState(false);

  // Create Vibe Modal state (opened via "+" in Vibe List)
  const [createVibeOpen, setCreateVibeOpen] = useState(false);
  const [vibeTitle, setVibeTitle] = useState("");
  const [vibeLocation, setVibeLocation] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [submittingVibe, setSubmittingVibe] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [me, list] = await Promise.all([
          apiGet<SessionUser>("/api/auth/me"),
          apiGet<MapUser[]>("/api/users/nearby"),
        ]);
        if (cancelled) return;
        setUser(me);
        setUsers(list.filter((u) => u.lat != null && u.lng != null));
      } catch {
        /* ignore */
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const centerLat = user?.lat ?? 40.9927;
  const centerLng = user?.lng ?? 29.0277;

  // Filtered locations for general search
  const filteredLocations = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("tr-TR");
    return POPULAR_LOCATIONS.filter((loc) => {
      const matchTab = activeTab === "all" || loc.category === activeTab;
      if (!matchTab) return false;
      if (!q) return true;
      const titleMatch = loc.title.toLocaleLowerCase("tr-TR").includes(q);
      const subMatch = loc.subtitle.toLocaleLowerCase("tr-TR").includes(q);
      return titleMatch || subMatch;
    });
  }, [searchQuery, activeTab]);

  // Filtered locations for Vibe Location Picker
  const filteredPickerLocations = useMemo(() => {
    const q = pickerSearch.trim().toLocaleLowerCase("tr-TR");
    if (!q) return POPULAR_LOCATIONS;
    return POPULAR_LOCATIONS.filter((loc) => {
      return (
        loc.title.toLocaleLowerCase("tr-TR").includes(q) ||
        loc.subtitle.toLocaleLowerCase("tr-TR").includes(q)
      );
    });
  }, [pickerSearch]);

  // Navigate Map to selected location with smooth animation
  const navigateToLocation = (loc: LocationOption) => {
    setSelectedLocationLabel(loc.subtitle ? `${loc.title}, ${loc.subtitle.split(",")[0]}` : loc.title);
    setDestinationMarker({
      latitude: loc.lat,
      longitude: loc.lng,
      title: loc.title,
    });
    setSearchModalOpen(false);

    if (viewMode === "grid") {
      setViewMode("map");
    }

    setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: loc.delta,
          longitudeDelta: loc.delta,
        },
        1200
      );
    }, 150);
  };

  // 1. Hedef Butonu: Kullanıcının kendi konumuna odaklar
  const returnToUserLocation = () => {
    const lat = user?.lat ?? 40.9927;
    const lng = user?.lng ?? 29.0277;
    setSelectedLocationLabel(user?.city || "Mevcut Konum");
    setDestinationMarker(null);
    setSearchModalOpen(false);

    if (viewMode === "grid") {
      setViewMode("map");
    }

    setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        1000
      );
    }, 150);
  };

  // 2. Zar Butonu: Kullanıcıların yoğun olduğu rastgele başka bir şehre animasyonla uçar
  const rollDiceRandomCity = () => {
    const hotspots = POPULAR_LOCATIONS.filter((l) => l.category === "district" || l.category === "city");
    const rand = hotspots[Math.floor(Math.random() * hotspots.length)];
    setSelectedLocationLabel(`${rand.title}, ${rand.subtitle.split(",")[0]}`);
    setDestinationMarker({
      latitude: rand.lat,
      longitude: rand.lng,
      title: rand.title,
    });

    if (viewMode === "grid") {
      setViewMode("map");
    }

    setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: rand.lat,
          longitude: rand.lng,
          latitudeDelta: rand.delta,
          longitudeDelta: rand.delta,
        },
        1400
      );
    }, 150);
  };

  // 3. El Sallama (Wave) Handler
  const handleWave = async (targetUserId: string, targetName: string) => {
    if (wavedUsers[targetUserId]) {
      Alert.alert("Bilgi", `${targetName} kullanıcısına zaten el salladın! 👋`);
      return;
    }

    setWavedUsers((prev) => ({ ...prev, [targetUserId]: true }));
    setWaveFeedback(`${targetName} kullanıcısına el salladın! 👋`);
    setTimeout(() => setWaveFeedback(null), 3000);

    try {
      await apiPost("/api/wave", { target_user_id: targetUserId });
    } catch {
      // Revert if request failed
      setWavedUsers((prev) => ({ ...prev, [targetUserId]: false }));
      Alert.alert("Hata", "El sallama iletilemedi. Lütfen tekrar deneyin.");
    }
  };

  // 4. Load Vibe Posts list
  const loadVibes = async () => {
    setLoadingVibes(true);
    try {
      const list = await apiGet<VibePostItem[]>("/api/vibe/posts");
      setVibePosts(list);
    } catch {
      /* ignore */
    } finally {
      setLoadingVibes(false);
    }
  };

  const handleOpenVibeList = () => {
    setVibeListOpen(true);
    void loadVibes();
  };

  // 5. Create Vibe Post handler (verified location enforced)
  const handleCreateVibe = async () => {
    if (!vibeTitle.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen bir etkinlik/vibe başlığı yazın.");
      return;
    }
    if (!vibeLocation) {
      Alert.alert("Eksik Bilgi", "Lütfen onaylı listeden geçerli bir etkinlik yeri seçin.");
      return;
    }
    setSubmittingVibe(true);
    try {
      await apiPost("/api/vibe/posts", {
        title: vibeTitle.trim(),
        location_tag: vibeLocation,
      });
      setVibeTitle("");
      setVibeLocation(null);
      setCreateVibeOpen(false);
      void loadVibes();
      Alert.alert("Harika! 🎉", "Vibe etkinliğin başarıyla paylaşıldı!");
    } catch {
      Alert.alert("Hata", "Vibe paylaşılamadı.");
    } finally {
      setSubmittingVibe(false);
    }
  };

  return (
    <View className="flex-1 bg-zinc-950">
      {/* 1. MAP VIEW (PITCH DARK MAPVIEW WITH GLOWING ENLARGED AVATARS) */}
      {viewMode === "map" ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          customMapStyle={PITCH_DARK_MAP_STYLE}
          initialRegion={{
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          }}
          showsUserLocation
          showsCompass={false}
        >
          {/* Floating Glowing User Circles (Enlarged, NO names underneath) */}
          {users.map((u) => (
            <Marker
              key={u.id}
              coordinate={{ latitude: u.lat, longitude: u.lng }}
              onPress={() => router.push(`/profile/${u.id}` as any)}
            >
              <View className="items-center justify-center">
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 0, 127, 0.28)",
                    shadowColor: "#FF007F",
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 14,
                    shadowOpacity: 0.95,
                    elevation: 10,
                  }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      overflow: "hidden",
                      borderWidth: 2.5,
                      borderColor: "#ffffff",
                      backgroundColor: "#18181b",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {u.avatar_url ? (
                      <Image
                        source={{ uri: u.avatar_url }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "900" }}>
                        {u.name.slice(0, 1)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Marker>
          ))}

          {/* Selected Search Destination Pin */}
          {destinationMarker && (
            <Marker
              coordinate={{
                latitude: destinationMarker.latitude,
                longitude: destinationMarker.longitude,
              }}
              title={destinationMarker.title}
            >
              <View className="items-center">
                <View
                  className="rounded-full px-3.5 py-1.5 border border-white shadow-xl"
                  style={{ backgroundColor: "#FF007F" }}
                >
                  <Text className="text-white text-xs font-black tracking-wide">
                    📍 {destinationMarker.title}
                  </Text>
                </View>
                <View
                  className="h-2.5 w-2.5 rotate-45 -mt-1"
                  style={{ backgroundColor: "#FF007F" }}
                />
              </View>
            </Marker>
          )}
        </MapView>
      ) : (
        /* 2. GRID VIEW (IZGARA PROFİL GÖRÜNÜMÜ - 2 SÜTUNLU MODERN DATING/DISCOVERY) */
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#09090b" }}>
          {/* Grid Header Info */}
          <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-black text-white">Çevrendekiler</Text>
              <Text className="text-xs text-zinc-400 mt-0.5">
                {users.length} aktif kişi yakınında
              </Text>
            </View>
            <View className="rounded-full bg-violet-600/20 px-3 py-1 border border-violet-500/40">
              <Text className="text-xs font-bold text-violet-300">Izgara Modu</Text>
            </View>
          </View>

          {/* Grid Items List */}
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 110,
              gap: 12,
            }}
            columnWrapperStyle={{ gap: 12 }}
            ListEmptyComponent={
              <View className="py-24 items-center justify-center">
                <Text className="text-zinc-400 text-base font-semibold">
                  Yakınında profil bulunamadı
                </Text>
                <Text className="text-zinc-600 text-xs mt-1">
                  Haritadan başka bir konumu seçebilirsiniz.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isWaved = wavedUsers[item.id];
              return (
                <Pressable
                  onPress={() => router.push(`/profile/${item.id}` as any)}
                  className="rounded-3xl border border-zinc-800/80 bg-zinc-900 overflow-hidden relative active:scale-98"
                  style={{
                    width: GRID_ITEM_WIDTH,
                    height: 230,
                    elevation: 4,
                  }}
                >
                  {/* Photo */}
                  {item.avatar_url ? (
                    <Image
                      source={{ uri: item.avatar_url }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-zinc-800 items-center justify-center">
                      <Text className="text-4xl font-black text-zinc-600">
                        {item.name.slice(0, 1)}
                      </Text>
                    </View>
                  )}

                  {/* Dark gradient overlay at bottom */}
                  <View
                    className="absolute inset-x-0 bottom-0 p-3 pt-8 justify-end"
                    style={{
                      backgroundColor: "rgba(9, 9, 11, 0.85)",
                    }}
                  >
                    <Text className="text-white font-black text-base" numberOfLines={1}>
                      {item.name}
                      {item.age ? `, ${item.age}` : ""}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <MapPin size={12} color="#a78bfa" />
                      <Text
                        className="text-zinc-300 text-xs font-medium"
                        numberOfLines={1}
                      >
                        {item.city || "İstanbul"}
                      </Text>
                    </View>
                  </View>

                  {/* WAVE (EL SALLAMA) BUTTON IN TOP-RIGHT */}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      void handleWave(item.id, item.name);
                    }}
                    className={`absolute top-2.5 right-2.5 h-10 w-10 items-center justify-center rounded-full border shadow-lg active:scale-90 ${
                      isWaved
                        ? "bg-emerald-600 border-emerald-400"
                        : "bg-black/60 border-violet-500/50"
                    }`}
                    style={{ elevation: 6 }}
                  >
                    {isWaved ? (
                      <Check size={18} color="#ffffff" strokeWidth={2.5} />
                    ) : (
                      <Hand size={18} color="#c4b5fd" strokeWidth={2.2} />
                    )}
                  </Pressable>
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      )}

      {/* TOP OVERLAY (Sadece Konum Arama Barı ve Profil Avatarı) */}
      {viewMode === "map" && (
        <SafeAreaView pointerEvents="box-none" className="absolute top-0 left-0 right-0 p-4">
          <View pointerEvents="box-none" className="flex-row justify-between items-start">
            {/* Interactive Location Search Bar Button (Saat ve Hava Durumu Silindi!) */}
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setSearchModalOpen(true);
              }}
              className="flex-row items-center gap-2 rounded-2xl border border-violet-500/40 bg-zinc-950/90 px-4 py-2.5 shadow-xl active:bg-zinc-900"
              style={{ elevation: 8 }}
            >
              <MapPin size={18} color="#a78bfa" />
              <View>
                <Text className="text-[10px] uppercase font-black text-violet-400">
                  Konum Ara
                </Text>
                <Text
                  className="font-black text-white text-xs max-w-[150px]"
                  numberOfLines={1}
                >
                  {selectedLocationLabel || user?.city || "İstanbul, Kadıköy"}
                </Text>
              </View>
              <ChevronDown size={14} color="#a1a1aa" className="ml-1" />
            </Pressable>

            {/* Profile Settings Avatar */}
            <Pressable
              onPress={() => router.push("/settings")}
              className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-600 bg-zinc-900 shadow-xl active:opacity-80"
              style={{ elevation: 8 }}
            >
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} className="h-full w-full object-cover" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {user?.name ? user.name.slice(0, 1) : "D"}
                </Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      {/* FLOATING WAVE TOAST NOTIFICATION */}
      {waveFeedback && (
        <SafeAreaView
          pointerEvents="none"
          className="absolute top-2 left-0 right-0 items-center z-50 px-6"
        >
          <View
            className="flex-row items-center gap-2.5 rounded-full px-5 py-3 border border-violet-500/60 bg-zinc-950/95 shadow-2xl"
            style={{ elevation: 12 }}
          >
            <Hand size={18} color="#a78bfa" />
            <Text className="text-sm font-bold text-white tracking-wide">
              {waveFeedback}
            </Text>
          </View>
        </SafeAreaView>
      )}

      {/* SAĞ YÜZEN BUTONLAR (FLOATING ACTION BAR: 4 BUTON) */}
      <View
        pointerEvents="box-none"
        className="absolute right-4 top-1/2 -translate-y-1/2 gap-3.5 z-40 items-center"
      >
        {/* 1. Hedef İkonu: Kendi lokasyonuna odaklar */}
        <Pressable
          onPress={returnToUserLocation}
          className="h-13 w-13 items-center justify-center rounded-full border border-violet-500/50 bg-zinc-950/95 shadow-2xl active:scale-95"
          style={{ elevation: 8 }}
        >
          <Crosshair size={22} color="#c4b5fd" strokeWidth={2.2} />
        </Pressable>

        {/* 2. Zar İkonu: Rastgele yoğun bir şehre uçar */}
        <Pressable
          onPress={rollDiceRandomCity}
          className="h-13 w-13 items-center justify-center rounded-full border border-amber-500/50 bg-zinc-950/95 shadow-2xl active:scale-95"
          style={{ elevation: 8 }}
        >
          <Dices size={22} color="#fcd34d" strokeWidth={2.2} />
        </Pressable>

        {/* 3. Etkinlik/Takvim İkonu: Etkinlikler Listesi modalını açar */}
        <Pressable
          onPress={handleOpenVibeList}
          className="h-13 w-13 items-center justify-center rounded-full border border-emerald-500/50 bg-zinc-950/95 shadow-2xl active:scale-95"
          style={{ elevation: 8 }}
        >
          <CalendarPlus size={22} color="#6ee7b7" strokeWidth={2.2} />
        </Pressable>

        {/* 4. Grid / Harita Modu Değiştirme Butonu (4. BUTON) */}
        <Pressable
          onPress={() => setViewMode((prev) => (prev === "map" ? "grid" : "map"))}
          className={`h-13 w-13 items-center justify-center rounded-full border shadow-2xl active:scale-95 ${
            viewMode === "grid"
              ? "border-emerald-500/60 bg-emerald-950/90"
              : "border-violet-500/60 bg-zinc-950/95"
          }`}
          style={{ elevation: 8 }}
        >
          {viewMode === "map" ? (
            <Grid2X2 size={22} color="#c4b5fd" strokeWidth={2.2} />
          ) : (
            <MapIcon size={22} color="#6ee7b7" strokeWidth={2.2} />
          )}
        </Pressable>
      </View>

      {/* FULL-SCREEN MAP SEARCH MODAL (ONARILMIŞ VE STABİL) */}
      <Modal
        visible={searchModalOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSearchModalOpen(false)}
      >
        <SafeAreaView edges={["top", "bottom", "left", "right"]} style={{ flex: 1, backgroundColor: "#09090b" }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View className="px-5 pb-3 pt-2 bg-zinc-950 border-b border-zinc-900">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-black text-white tracking-tight">
                  Haritada Ara & Keşfet
                </Text>
                <Pressable
                  onPress={() => setSearchModalOpen(false)}
                  className="h-9 w-9 items-center justify-center rounded-full bg-zinc-900 active:bg-zinc-800"
                >
                  <X size={18} color="#ffffff" />
                </Pressable>
              </View>

              {/* Search Bar Input */}
              <View className="flex-row items-center rounded-2xl border border-zinc-800 bg-zinc-900/90 px-3.5 h-12 gap-2.5">
                <Search size={18} color="#a1a1aa" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="İlçe, il veya ülke ara (Örn: Kadıköy, İzmir, Roma)..."
                  placeholderTextColor="#71717a"
                  className="flex-1 text-white text-sm"
                  autoFocus
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <X size={16} color="#a1a1aa" />
                  </Pressable>
                )}
              </View>

              {/* Filter Tabs */}
              <View className="flex-row items-center gap-2 mt-3">
                {[
                  { key: "all", label: "Tümü" },
                  { key: "district", label: "Popüler Semtler" },
                  { key: "city", label: "İller" },
                  { key: "world", label: "Dünya" },
                ].map((tab) => {
                  const isAct = activeTab === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key as any)}
                      className={`rounded-full px-3 py-1.5 border ${
                        isAct
                          ? "bg-violet-600 border-violet-500"
                          : "bg-zinc-900/80 border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isAct ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Quick Action: Return to Current Location */}
            <Pressable
              onPress={returnToUserLocation}
              className="flex-row items-center justify-between px-5 py-3.5 bg-violet-950/20 border-b border-violet-900/30 active:bg-violet-950/40"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-600/30 border border-violet-500/40">
                  <Navigation size={18} color="#c4b5fd" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-violet-200">
                    Mevcut Konumuma Git
                  </Text>
                  <Text className="text-xs text-violet-400/80">
                    {user?.city || "Profil konumunuz"}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#a78bfa" />
            </Pressable>

            {/* Location Results List */}
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                paddingBottom: Math.max(insets.bottom, 24) + 30,
                gap: 8,
              }}
              ListEmptyComponent={
                <View className="py-20 items-center">
                  <Text className="text-zinc-500 text-base font-semibold">
                    Sonuç bulunamadı
                  </Text>
                  <Text className="text-zinc-600 text-xs mt-1">
                    Farklı bir ilçe veya şehir adı deneyebilirsiniz.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const IconComponent =
                  item.category === "district"
                    ? MapPin
                    : item.category === "city"
                    ? Building2
                    : Globe;

                const iconColor =
                  item.category === "district"
                    ? "#a78bfa"
                    : item.category === "city"
                    ? "#fcd34d"
                    : "#38bdf8";

                const iconBg =
                  item.category === "district"
                    ? "rgba(167, 139, 250, 0.15)"
                    : item.category === "city"
                    ? "rgba(252, 211, 77, 0.15)"
                    : "rgba(56, 189, 248, 0.15)";

                return (
                  <Pressable
                    onPress={() => navigateToLocation(item)}
                    className="flex-row items-center justify-between p-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 active:bg-zinc-800/80"
                  >
                    <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                      <View
                        className="h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: iconBg }}
                      >
                        <IconComponent size={20} color={iconColor} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-white tracking-wide">
                          {item.title}
                        </Text>
                        <Text className="text-xs text-zinc-400 mt-0.5">
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="rounded-full px-2.5 py-0.5 bg-zinc-800 border border-zinc-700">
                        <Text className="text-[10px] font-semibold text-zinc-300">
                          {item.category === "district"
                            ? "Semt"
                            : item.category === "city"
                            ? "İl"
                            : "Dünya"}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#71717a" />
                    </View>
                  </Pressable>
                );
              }}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* 1. ETKİNLİKLER (VİBE) LİSTESİ MODALI */}
      <Modal
        visible={vibeListOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVibeListOpen(false)}
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#09090b" }}>
          {/* Header */}
          <View className="px-5 py-3.5 border-b border-zinc-900 bg-zinc-950 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <Sparkles size={20} color="#6ee7b7" />
              <Text className="text-xl font-black text-white">Etkinlikler (Vibe)</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {/* '+' (Yeni Ekle) Butonu */}
              <Pressable
                onPress={() => {
                  setVibeTitle("");
                  setVibeLocation(null);
                  setCreateVibeOpen(true);
                }}
                className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 active:bg-emerald-700 shadow-lg"
              >
                <Plus size={16} color="#ffffff" strokeWidth={3} />
                <Text className="text-xs font-black text-white">Yeni Ekle</Text>
              </Pressable>

              {/* Kapat Butonu */}
              <Pressable
                onPress={() => setVibeListOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-zinc-900 active:bg-zinc-800"
              >
                <X size={18} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          {/* Vibe Posts List */}
          {loadingVibes ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#6ee7b7" />
              <Text className="text-xs text-zinc-500 mt-2">Etkinlikler yükleniyor...</Text>
            </View>
          ) : (
            <FlatList
              data={vibePosts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 40,
                gap: 12,
              }}
              ListEmptyComponent={
                <View className="py-24 items-center justify-center px-6">
                  <View className="h-16 w-16 rounded-full bg-zinc-900 items-center justify-center mb-3">
                    <CalendarPlus size={28} color="#6ee7b7" />
                  </View>
                  <Text className="text-white text-base font-black">Henüz Etkinlik Yok</Text>
                  <Text className="text-zinc-500 text-xs text-center mt-1 max-w-xs">
                    Çevrendekilerle buluşmak ve yeni anlar paylaşmak için ilk etkinliği sen oluştur!
                  </Text>
                  <Pressable
                    onPress={() => {
                      setVibeTitle("");
                      setVibeLocation(null);
                      setCreateVibeOpen(true);
                    }}
                    className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 active:bg-emerald-700"
                  >
                    <Text className="text-white font-bold text-sm">İlk Etkinliği Paylaş 🚀</Text>
                  </Pressable>
                </View>
              }
              renderItem={({ item }) => (
                <View className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-4">
                  {/* Author Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Pressable
                      onPress={() => {
                        setVibeListOpen(false);
                        router.push(`/profile/${item.user_id}` as any);
                      }}
                      className="flex-row items-center gap-3 flex-1"
                    >
                      {item.author_avatar ? (
                        <Image
                          source={{ uri: item.author_avatar }}
                          className="h-10 w-10 rounded-full bg-zinc-800"
                        />
                      ) : (
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                          <Text className="text-sm font-bold text-white">
                            {(item.author_name || "?").slice(0, 1)}
                          </Text>
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-white">
                          {item.author_name}
                        </Text>
                        <Text className="text-[11px] text-zinc-500">
                          {formatRelativeTr(item.created_at)}
                        </Text>
                      </View>
                    </Pressable>

                    {item.location_tag && (
                      <View className="flex-row items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1">
                        <MapPin size={12} color="#6ee7b7" />
                        <Text className="text-[11px] font-bold text-emerald-300">
                          {item.location_tag}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Vibe Content */}
                  <Text className="text-base font-bold text-white leading-relaxed">
                    {item.title}
                  </Text>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* 2. YENİ VİBE OLUŞTUR MODALI (ZORUNLU ONAYLI LOKASYON SEÇİMİ) */}
      <Modal
        visible={createVibeOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateVibeOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable
            onPress={() => setCreateVibeOpen(false)}
            className="flex-1 bg-black/75 justify-end"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-6 pb-12"
            >
              <View className="flex-row justify-between items-center mb-5">
                <View className="flex-row items-center gap-2">
                  <Sparkles size={20} color="#6ee7b7" />
                  <Text className="text-xl font-black text-white">Yeni Vibe Paylaş</Text>
                </View>
                <Pressable
                  onPress={() => setCreateVibeOpen(false)}
                  className="h-8 w-8 items-center justify-center rounded-full bg-zinc-900"
                >
                  <X size={18} color="#a1a1aa" />
                </Pressable>
              </View>

              {/* Başlık Input */}
              <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Başlık
              </Text>
              <TextInput
                value={vibeTitle}
                onChangeText={setVibeTitle}
                placeholder="Aklından geçen vibe nedir? (Örn: Sahilde kahve & sohbet)"
                placeholderTextColor="#71717a"
                className="h-12 rounded-xl bg-zinc-900 px-4 text-white mb-4 border border-zinc-800 text-sm"
              />

              {/* Etkinlik Yeri: Kesinlikle serbest metin değil, onaylı listeden seçim! */}
              <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Etkinlik Yeri (Harita Motorundan Seçiniz)
              </Text>
              <Pressable
                onPress={() => {
                  setPickerSearch("");
                  setLocationPickerOpen(true);
                }}
                className={`flex-row items-center justify-between h-13 rounded-xl bg-zinc-900 px-4 mb-6 border ${
                  vibeLocation ? "border-emerald-500/60" : "border-zinc-800"
                }`}
              >
                <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                  <MapPin size={18} color={vibeLocation ? "#6ee7b7" : "#71717a"} />
                  <Text
                    numberOfLines={1}
                    className={`text-sm ${
                      vibeLocation ? "text-white font-bold" : "text-zinc-500 italic"
                    }`}
                  >
                    {vibeLocation || "Lokasyon seçmek için dokunun..."}
                  </Text>
                </View>
                {vibeLocation ? (
                  <View className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 border border-emerald-500/40">
                    <Text className="text-[10px] font-bold text-emerald-300">Seçildi</Text>
                  </View>
                ) : (
                  <ChevronRight size={18} color="#71717a" />
                )}
              </Pressable>

              {/* Paylaş Butonu */}
              <Pressable
                onPress={handleCreateVibe}
                disabled={submittingVibe || !vibeTitle.trim() || !vibeLocation}
                className={`h-14 items-center justify-center rounded-2xl ${
                  vibeTitle.trim() && vibeLocation
                    ? "bg-emerald-600 active:bg-emerald-700"
                    : "bg-zinc-800 opacity-60"
                }`}
              >
                {submittingVibe ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-base font-black text-white">Etkinliği Paylaş</Text>
                )}
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* 3. VİBE ETKİNLİK YERİ SEÇİCİ MODALI (GERÇEK LOKASYON LİSTESİ) */}
      <Modal
        visible={locationPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationPickerOpen(false)}
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#09090b" }}>
          <View className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-zinc-900 bg-zinc-950">
            <Text className="text-lg font-black text-white">Etkinlik Yeri Seç</Text>
            <Pressable
              onPress={() => setLocationPickerOpen(false)}
              className="h-9 w-9 items-center justify-center rounded-full bg-zinc-900"
            >
              <X size={18} color="#ffffff" />
            </Pressable>
          </View>

          {/* Search bar inside location picker */}
          <View className="p-4 bg-zinc-950 border-b border-zinc-900">
            <View className="flex-row items-center rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 h-11 gap-2.5">
              <Search size={16} color="#71717a" />
              <TextInput
                value={pickerSearch}
                onChangeText={setPickerSearch}
                placeholder="Semt veya şehir ara..."
                placeholderTextColor="#71717a"
                className="flex-1 text-white text-sm"
              />
              {pickerSearch.length > 0 && (
                <Pressable onPress={() => setPickerSearch("")}>
                  <X size={16} color="#71717a" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Location results list */}
          <FlatList
            data={filteredPickerLocations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            renderItem={({ item }) => {
              const formattedLoc = `${item.title}, ${item.subtitle.split(",")[0]}`;
              const isSelected = vibeLocation === formattedLoc;
              return (
                <Pressable
                  onPress={() => {
                    setVibeLocation(formattedLoc);
                    setLocationPickerOpen(false);
                  }}
                  className={`flex-row items-center justify-between p-3.5 rounded-2xl border ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-950/20"
                      : "border-zinc-800 bg-zinc-900/70 active:bg-zinc-800"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <MapPin size={18} color={isSelected ? "#6ee7b7" : "#a1a1aa"} />
                    <View>
                      <Text className="text-sm font-bold text-white">{item.title}</Text>
                      <Text className="text-xs text-zinc-400">{item.subtitle}</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={18} color="#6ee7b7" strokeWidth={2.5} />}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
