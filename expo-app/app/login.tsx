import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { API_BASE, apiFetch, apiPost } from "../src/api";
import { profileComplete, type SessionUser } from "../src/types";

// Ensures auth session finishes cleanly if redirected back
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const checkSessionAndNavigate = async (): Promise<boolean> => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const u = (await res.json()) as SessionUser;
        if (profileComplete(u)) {
          router.replace("/(tabs)/map");
        } else {
          router.replace("/onboarding");
        }
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
      const authUrl = `${API_BASE}/api/auth/google`;

      // Opens directly inside the application (in-app sheet)
      await WebBrowser.openAuthSessionAsync(authUrl, "dambul://");

      // Check session after closing/redirect
      const success = await checkSessionAndNavigate();
      if (!success) {
        setTimeout(async () => {
          await checkSessionAndNavigate();
        }, 1200);
      }
    } catch (err) {
      Alert.alert("Giriş Hatası", "Giriş işlemi sırasında bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const res = await apiPost<{ ok: boolean; user: SessionUser }>("/api/auth/dev-login");
      if (res.ok && res.user) {
        if (profileComplete(res.user)) {
          router.replace("/(tabs)/map");
        } else {
          router.replace("/onboarding");
        }
      } else {
        Alert.alert("Hata", "Test kullanıcısı bulunamadı.");
      }
    } catch (e) {
      Alert.alert("Hata", "Sunucuya bağlanılamadı. Sunucunun çalıştığından emin olun.");
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

        {/* Manual session check button in case user completed web login */}
        <Pressable
          onPress={() => void checkSessionAndNavigate()}
          className="mt-6 py-2 px-4 rounded-xl bg-zinc-900/60 active:bg-zinc-800"
        >
          <Text className="text-xs text-zinc-400">Oturumu Kontrol Et / Yenile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
