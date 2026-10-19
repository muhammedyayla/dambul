import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { API_BASE, apiFetch } from "../src/api";
import { setToken } from "../src/auth";
import { profileComplete, type SessionUser } from "../src/types";

// Ensures auth session finishes cleanly if redirected back
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const navigateForUser = (user: SessionUser) => {
    if (!profileComplete(user)) {
      router.replace("/onboarding");
    } else if (!user.gender?.trim()) {
      router.replace("/gender");
    } else {
      router.replace("/(tabs)/map");
    }
  };

  const checkSessionAndNavigate = async (): Promise<boolean> => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const u = (await res.json()) as SessionUser;
        navigateForUser(u);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        if (typeof window === "undefined") {
          throw new Error("Web OAuth yalnızca tarayıcıda başlatılabilir.");
        }
        window.location.assign(`${API_BASE}/api/auth/google`);
        return;
      }

      // Expo'nun oluşturduğu redirect URI (Expo Go'da exp://... veya dambul://auth)
      const redirectUrl = Linking.createURL("auth");

      // Sunucuya mobile_redirect_uri olarak gönder — callback bu URI'ye token ile yönlendirir
      const authUrl = `${API_BASE}/api/auth/google?mobile_redirect_uri=${encodeURIComponent(redirectUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === "success" && result.url) {
        // Parse token from redirect URL: exp://...?token=xxx veya dambul://auth?token=xxx
        let token: string | null = null;
        try {
          const urlObj = new URL(result.url);
          token = urlObj.searchParams.get("token");
        } catch {
          const match = result.url.match(/[?&#]token=([^&#]+)/);
          token = match ? decodeURIComponent(match[1]) : null;
        }

        if (token) {
          await setToken(token);
          const success = await checkSessionAndNavigate();
          if (!success) {
            Alert.alert("Hata", "Token kaydedildi ancak profil bilgisi doğrulanamadı.");
          }
          return;
        }

        // URL içinde hata parametresi var mı?
        const errorMatch = result.url.match(/[?&#]error=([^&#]+)/);
        if (errorMatch) {
          Alert.alert("Giriş Başarısız", `Google hatası: ${decodeURIComponent(errorMatch[1])}`);
          return;
        }
      } else if (result.type === "cancel" || result.type === "dismiss") {
        // Kullanıcı giriş penceresini kapattı
        return;
      }

      // Fallback: Web veya çerezli oturum kontrolü
      const success = await checkSessionAndNavigate();
      if (!success) {
        setTimeout(async () => {
          await checkSessionAndNavigate();
        }, 1200);
      }
    } catch (err: any) {
      Alert.alert(
        "Giriş Hatası",
        `Giriş işlemi sırasında bir sorun oluştu.\nAPI: ${API_BASE}\nDetay: ${err?.message || err}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Seçenek A (Doğrudan Google Token ile oturum açma)
  const loginWithGoogleTokens = async (tokens: { access_token?: string; id_token?: string }) => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/google/mobile", {
        method: "POST",
        body: JSON.stringify(tokens),
      });
      if (!res.ok) {
        const errText = await res.text();
        Alert.alert("Giriş Hatası", `Sunucu hatası: ${res.status} - ${errText}`);
        return;
      }
      const data = (await res.json()) as { ok: boolean; user: SessionUser; token?: string };
      if (data.ok && data.user) {
        if (data.token) {
          await setToken(data.token);
        }
        navigateForUser(data.user);
      }
    } catch (e: any) {
      Alert.alert("Hata", `Giriş yapılamadı: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/dev-login", { method: "POST" });
      if (!res.ok) {
        const errText = await res.text();
        Alert.alert("Hata", `Sunucu hatası: ${res.status} - ${errText}`);
        return;
      }
      const data = (await res.json()) as { ok: boolean; user: SessionUser; token?: string };
      if (data.ok && data.user) {
        // Save the JWT token for future requests
        if (data.token) {
          await setToken(data.token);
        }
        navigateForUser(data.user);
      } else {
        Alert.alert("Hata", "Test kullanıcısı bulunamadı.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      Alert.alert("Hata", `Sunucuya bağlanılamadı.\n\nAPI: ${API_BASE}\nDetay: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950 justify-center px-6">
      <View className="w-full max-w-sm self-center items-center">
        <Text className="text-5xl font-black tracking-tight text-white mb-2">Dambul</Text>
        <Text className="text-zinc-400 text-base mb-2">Yakınındaki insanları keşfet</Text>
        <Text className="text-zinc-500 text-xs text-center mb-8">
          E-posta/şifre yok. İlk Google girişinde hesap otomatik oluşur.
        </Text>

        <View className="w-full gap-3">
          <Pressable
            onPress={handleDevLogin}
            disabled={loading}
            className="h-14 w-full items-center justify-center rounded-2xl bg-violet-600 active:bg-violet-700 shadow-xl"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-bold text-white">⚡ Hızlı Test Girişi (Geliştirici)</Text>
            )}
          </Pressable>

          <View className="flex-row items-center my-1 gap-2">
            <View className="flex-1 h-[1px] bg-zinc-800" />
            <Text className="text-xs text-zinc-600 font-medium">veya</Text>
            <View className="flex-1 h-[1px] bg-zinc-800" />
          </View>

          <Pressable
            onPress={handleGoogleAuth}
            disabled={loading}
            className="h-14 w-full items-center justify-center rounded-2xl bg-white active:bg-zinc-200 shadow-md"
          >
            <Text className="text-base font-semibold text-zinc-900">Google ile Giriş Yap</Text>
          </Pressable>

          <Pressable
            onPress={handleGoogleAuth}
            disabled={loading}
            className="h-14 w-full items-center justify-center rounded-2xl border border-zinc-600 bg-transparent active:bg-zinc-900"
          >
            <Text className="text-sm font-semibold text-zinc-200">Google ile Kayıt Ol</Text>
          </Pressable>
        </View>

        <Text className="mt-8 text-center text-xs text-zinc-600">
          Test girişi ile doğrudan hesabınıza bağlanabilir ve tüm özellikleri test edebilirsiniz.
        </Text>

        {/* Debug info */}
        <Text className="mt-4 text-center text-[10px] text-zinc-700">
          API: {API_BASE}
        </Text>

        {/* Manual session check button in case user completed web login */}
        <Pressable
          onPress={() => void checkSessionAndNavigate()}
          className="mt-4 py-2 px-4 rounded-xl bg-zinc-900/60 active:bg-zinc-800"
        >
          <Text className="text-xs text-zinc-400">Oturumu Kontrol Et / Yenile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
