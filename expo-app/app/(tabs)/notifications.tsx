import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, MessageCircle, Hand } from "lucide-react-native";
import { useRouter } from "expo-router";
import { apiFetch, apiGet, apiPatch, apiPost } from "../../src/api";
import { formatRelativeTr } from "../../src/lib/time";

type NotificationRow = {
  id: string;
  actor_id: string | null;
  action: string;
  created_at: string;
  actor_name: string | null;
  actor_avatar: string | null;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const list = await apiGet<NotificationRow[]>("/api/notifications");
        if (cancelled) return;
        setRows(list);
        await apiPatch("/api/notifications/read", {});
        void apiFetch("/api/notifications/unread-count");
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReply = async (actorId: string) => {
    setReplyingId(actorId);
    try {
      const res = await apiPost<{ thread_id: string }>("/api/chat/threads", {
        other_user_id: actorId,
      });
      if (res.thread_id) {
        router.push(`/chat/${res.thread_id}` as any);
      }
    } catch {
      Alert.alert("Hata", "Sohbet başlatılamadı.");
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-5 pt-3 pb-4">
        <Text className="text-2xl font-black text-white">Bildirimler</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-zinc-900 mb-3">
                <Bell size={28} color="#52525b" />
              </View>
              <Text className="text-zinc-500 text-base">Bildiriminiz bulunmuyor</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isWave = item.action.includes("el salladı");
            return (
              <View className="flex-row items-center gap-3 py-3.5 border-b border-zinc-900">
                <Pressable
                  onPress={() => {
                    if (item.actor_id) router.push(`/profile/${item.actor_id}` as any);
                  }}
                >
                  {item.actor_avatar ? (
                    <Image
                      source={{ uri: item.actor_avatar }}
                      className="h-12 w-12 rounded-full bg-zinc-800"
                    />
                  ) : (
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                      <Text className="text-base font-bold text-white">
                        {(item.actor_name || "?").slice(0, 1)}
                      </Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  className="flex-1"
                  onPress={() => {
                    if (item.actor_id) router.push(`/profile/${item.actor_id}` as any);
                  }}
                >
                  <Text className="text-sm text-zinc-200">
                    <Text className="font-bold text-white">{item.actor_name || "Biri"}</Text>{" "}
                    {item.action}
                  </Text>
                  <Text className="text-xs text-zinc-500 mt-1">
                    {formatRelativeTr(item.created_at)}
                  </Text>
                </Pressable>

                {item.actor_id && (
                  <Pressable
                    onPress={() => handleReply(item.actor_id!)}
                    disabled={replyingId === item.actor_id}
                    className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                      isWave
                        ? "bg-violet-600/20 border-violet-500 active:bg-violet-600/40"
                        : "bg-zinc-900 border-zinc-800 active:bg-zinc-800"
                    }`}
                  >
                    {replyingId === item.actor_id ? (
                      <ActivityIndicator size="small" color="#c4b5fd" />
                    ) : (
                      <>
                        <MessageCircle size={14} color={isWave ? "#c4b5fd" : "#a1a1aa"} />
                        <Text
                          className={`text-xs font-bold ${
                            isWave ? "text-violet-300" : "text-zinc-300"
                          }`}
                        >
                          Yanıtla
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
