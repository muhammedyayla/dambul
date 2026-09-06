import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, X, Flame } from "lucide-react-native";
import { apiGet, apiPost } from "../../src/api";
import { ProfileDetailView, ProfileDetailUser } from "../../src/components/ProfileDetailView";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 110;

export default function SwipeScreen() {
  const [stack, setStack] = useState<ProfileDetailUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"like" | "pass" | null>(null);

  // Keep a synchronous ref to current stack to avoid stale closures
  const stackRef = useRef<ProfileDetailUser[]>([]);
  stackRef.current = stack;

  // Animation values for physical swipe gesture
  const pan = useRef(new Animated.ValueXY()).current;
  const isSwiping = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiGet<ProfileDetailUser[]>("/api/users/swipe");
      setStack(list);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const current = stack[0];

  // Core dismissal function with state advance and full screen animation
  const handleSwipe = (type: "pass" | "like") => {
    if (isSwiping.current || stackRef.current.length === 0) return;
    const targetUser = stackRef.current[0];
    if (!targetUser) return;

    isSwiping.current = true;

    // Show full-screen feedback
    setFeedback(type);
    setTimeout(() => {
      setFeedback(null);
    }, 600);

    const toX = type === "like" ? SCREEN_WIDTH + 200 : -SCREEN_WIDTH - 200;

    Animated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      // Synchronously pop top user so next card shows immediately
      setStack((prev) => prev.slice(1));
      pan.setValue({ x: 0, y: 0 });
      isSwiping.current = false;

      // Background persist to database
      void apiPost("/api/likes", {
        to_user: targetUser.id,
        type: type === "like" ? "like" : "pass",
      });
    });
  };

  // PanResponder for physical drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 12 &&
          !isSwiping.current
        );
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          handleSwipe("like");
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          handleSwipe("pass");
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Rotation and badge opacities based on drag
  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [20, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const passOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#09090b" }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-black tracking-tight text-white">Dambull</Text>
          <View className="rounded-full bg-violet-500/20 px-2.5 py-0.5 border border-violet-500/40">
            <Text className="text-[10px] font-bold text-violet-300">KEŞFET</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 px-3 pb-24">
        {loading ? (
          <View key="state-loading" className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FF007F" />
            <Text className="text-xs text-zinc-500 mt-2 font-medium">Profiller yükleniyor...</Text>
          </View>
        ) : !current ? (
          <View key="state-empty" className="flex-1 items-center justify-center">
            <Text className="text-zinc-400 text-base font-semibold">Yakınında yeni profil kalmadı</Text>
            <Text className="text-zinc-600 text-xs mt-1 text-center max-w-xs">
              Daha önce oylamadığın profil kalmadı. Mesafe filtreni genişletebilir veya daha sonra tekrar kontrol edebilirsin.
            </Text>
            <Pressable
              onPress={() => void load()}
              className="mt-4 rounded-xl bg-violet-600 px-6 py-2.5 active:bg-violet-700"
              style={{ elevation: 4 }}
            >
              <Text className="text-xs font-bold text-white">Yenile</Text>
            </Pressable>
          </View>
        ) : (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              {
                flex: 1,
                transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
              },
            ]}
          >
            <View
              className="flex-1 overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950"
              style={{ elevation: 8 }}
            >
              {/* SWIPE OVERLAY BADGES */}
              {/* LIKE BADGE */}
              <Animated.View
                style={{
                  opacity: likeOpacity,
                  position: "absolute",
                  top: 35,
                  left: 30,
                  zIndex: 100,
                  transform: [{ rotate: "-18deg" }],
                }}
              >
                <View className="rounded-2xl border-4 border-emerald-400 bg-black/60 px-5 py-2">
                  <Text className="text-3xl font-black text-emerald-400 tracking-wider">
                    BEĞEN
                  </Text>
                </View>
              </Animated.View>

              {/* NOPE (PASS) BADGE */}
              <Animated.View
                style={{
                  opacity: passOpacity,
                  position: "absolute",
                  top: 35,
                  right: 30,
                  zIndex: 100,
                  transform: [{ rotate: "18deg" }],
                }}
              >
                <View className="rounded-2xl border-4 border-rose-500 bg-black/60 px-5 py-2">
                  <Text className="text-3xl font-black text-rose-500 tracking-wider">
                    PAS
                  </Text>
                </View>
              </Animated.View>

              {/* HINGE-STYLE PROFILE DETAIL (SHARED COMPONENT) */}
              <ProfileDetailView
                user={current}
                onBlockSuccess={() => setStack((prev) => prev.filter((u) => u.id !== current.id))}
                onReportSuccess={() => setStack((prev) => prev.filter((u) => u.id !== current.id))}
              />
            </View>
          </Animated.View>
        )}
      </View>

      {/* SADECE 2 SABİT ETKİLEŞİM BUTONU: Çarpı (Pass) ve Kalp (Like) */}
      {current ? (
        <View className="absolute bottom-5 left-0 right-0 flex-row items-center justify-center gap-8 px-6">
          {/* 1. Çarpı (Pass) */}
          <Pressable
            onPress={() => handleSwipe("pass")}
            className="h-16 w-16 items-center justify-center rounded-full border-2 border-rose-500/50 bg-zinc-900/95 active:scale-90"
            style={{ elevation: 8, shadowColor: "#f43f5e", shadowOpacity: 0.4, shadowRadius: 8 }}
          >
            <X size={30} color="#f43f5e" strokeWidth={2.5} />
          </Pressable>

          {/* 2. Kalp (Like) */}
          <Pressable
            onPress={() => handleSwipe("like")}
            className="h-16 w-16 items-center justify-center rounded-full active:scale-90"
            style={{
              backgroundColor: "#FF007F",
              elevation: 10,
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.4)",
              shadowColor: "#FF007F",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.7,
              shadowRadius: 12,
            }}
          >
            <Heart size={30} color="#ffffff" fill="#ffffff" />
          </Pressable>
        </View>
      ) : null}

      {/* TAM EKRAN FEEDBACK ANİMASYONU (LIKE / PASS) */}
      {feedback && (
        <View
          pointerEvents="none"
          className="absolute inset-0 z-50 items-center justify-center bg-black/40"
        >
          {feedback === "like" ? (
            <View
              className="items-center justify-center rounded-3xl p-8 border-2 border-[#FF007F] bg-zinc-950/90 shadow-2xl"
              style={{
                elevation: 20,
                shadowColor: "#FF007F",
                shadowRadius: 30,
                shadowOpacity: 0.9,
              }}
            >
              <Heart size={70} color="#FF007F" fill="#FF007F" />
              <Text className="text-2xl font-black text-white mt-3 tracking-widest">
                BEĞENDİN!
              </Text>
            </View>
          ) : (
            <View
              className="items-center justify-center rounded-3xl p-8 border-2 border-rose-500 bg-zinc-950/90 shadow-2xl"
              style={{
                elevation: 20,
                shadowColor: "#f43f5e",
                shadowRadius: 30,
                shadowOpacity: 0.9,
              }}
            >
              <X size={70} color="#f43f5e" strokeWidth={3} />
              <Text className="text-2xl font-black text-white mt-3 tracking-widest">
                PAS GEÇTİN
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
