import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { apiGet } from "../../src/api";
import { formatRelativeTr } from "../../src/lib/time";

type ThreadRow = {
  thread_id: string;
  other: { id: string; name: string; avatar_url: string | null; city: string | null };
  last_message: string | null;
  last_at: string | null;
};

export default function ChatListScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch threads with optional silent background refresh on focus
  const fetchThreads = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const list = await apiGet<ThreadRow[]>("/api/chat/threads");
      setRows(list);
    } catch {
      /* ignore */
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Refetch data every time screen comes into focus (e.g. returning from threadId)
  useFocusEffect(
    useCallback(() => {
      const isFirst = rows.length === 0;
      void fetchThreads(isFirst);
    }, [fetchThreads, rows.length])
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-5 pt-3 pb-4">
        <Text className="text-2xl font-black text-white">Sohbetler</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.thread_id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <Text className="text-zinc-500 text-base font-semibold">Henüz bir sohbetin yok</Text>
              <Text className="text-zinc-600 text-xs mt-1">
                Eşleştiğin kişilerle burada mesajlaşabilirsin.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/chat/${item.thread_id}` as any)}
              className="flex-row items-center gap-4 py-3.5 border-b border-zinc-900 active:opacity-75"
            >
              {item.other.avatar_url ? (
                <Image
                  source={{ uri: item.other.avatar_url }}
                  className="h-14 w-14 rounded-full bg-zinc-800"
                />
              ) : (
                <View className="h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
                  <Text className="text-xl font-bold text-white">
                    {item.other.name.slice(0, 1)}
                  </Text>
                </View>
              )}

              <View className="flex-1">
                <Text className="text-base font-bold text-white">{item.other.name}</Text>
                <Text numberOfLines={1} className="text-sm text-zinc-400 mt-0.5">
                  {item.last_message || "Henüz mesaj yok"}
                </Text>
              </View>

              {item.last_at ? (
                <Text className="text-xs text-zinc-500">{formatRelativeTr(item.last_at)}</Text>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
