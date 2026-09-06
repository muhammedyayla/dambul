import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { apiGet, apiPost } from "../../src/api";

type PostDetail = {
  id: string;
  user_id: string;
  title: string;
  location_tag: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_city: string | null;
  author_tags: unknown;
};

export default function VibePostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    void (async () => {
      try {
        const p = await apiGet<PostDetail>(`/api/vibe/posts/${postId}`);
        setPost(p);
      } catch {
        Alert.alert("Hata", "Gönderi bulunamadı.");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const sendMsg = async () => {
    if (!post) return;
    try {
      const r = await apiPost<{ thread_id: string }>("/api/chat/threads", {
        other_user_id: post.user_id,
      });
      router.push(`/chat/${r.thread_id}` as any);
    } catch {
      Alert.alert("Hata", "Sohbet başlatılamadı.");
    }
  };

  if (loading || !post) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  const tags = Array.isArray(post.author_tags) ? (post.author_tags as string[]) : [];

  return (
    <SafeAreaView className="flex-1 bg-zinc-950 px-5">
      {/* Header */}
      <View className="flex-row items-center pt-2 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-zinc-900 active:bg-zinc-800 mr-2"
        >
          <ChevronLeft size={22} color="#ffffff" />
        </Pressable>
        <Text className="text-lg font-bold text-white">Vibe Detayı</Text>
      </View>

      <View className="mt-2">
        <Text className="text-2xl font-black text-white leading-tight">{post.title}</Text>
        {post.location_tag ? (
          <View className="flex-row items-center gap-1.5 mt-2">
            <MapPin size={14} color="#a1a1aa" />
            <Text className="text-sm text-zinc-400">{post.location_tag}</Text>
          </View>
        ) : null}
      </View>

      {/* Author Card */}
      <Pressable
        onPress={() => router.push(`/profile/${post.user_id}` as any)}
        className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 active:bg-zinc-900"
      >
        <View className="flex-row items-center gap-4">
          {post.author_avatar ? (
            <Image
              source={{ uri: post.author_avatar }}
              className="h-16 w-16 rounded-full bg-zinc-800"
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <Text className="text-2xl font-bold text-white">
                {post.author_name.slice(0, 1)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">{post.author_name}</Text>
            <Text className="text-sm text-zinc-400 mt-0.5">
              {post.author_city || "Konum belirtilmedi"}
            </Text>
          </View>
        </View>

        {tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 mt-4">
            {tags.map((t) => (
              <View key={t} className="rounded-full bg-zinc-800 px-3 py-1">
                <Text className="text-xs text-zinc-300 font-medium">#{t}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>

      <Pressable
        onPress={sendMsg}
        className="mt-8 h-14 w-full items-center justify-center rounded-2xl bg-violet-600 active:bg-violet-700 shadow-xl"
      >
        <Text className="text-base font-bold text-white">Mesaj Gönder</Text>
      </Pressable>
    </SafeAreaView>
  );
}
