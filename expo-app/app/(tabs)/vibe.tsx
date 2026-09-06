import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, X, MapPin } from "lucide-react-native";
import { apiGet, apiPost } from "../../src/api";
import { formatRelativeTr } from "../../src/lib/time";

type Post = {
  id: string;
  title: string;
  location_tag: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
};

export default function VibeFeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loc, setLoc] = useState("");
  const [posting, setPosting] = useState(false);

  const loadPosts = async () => {
    try {
      const list = await apiGet<Post[]>("/api/vibe/posts");
      setPosts(list);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  const createPost = async () => {
    if (!title.trim()) return;
    setPosting(true);
    try {
      await apiPost("/api/vibe/posts", {
        title: title.trim(),
        location_tag: loc.trim() || null,
      });
      setTitle("");
      setLoc("");
      setModalOpen(false);
      void loadPosts();
    } catch {
      /* ignore */
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-5 pt-3 pb-4">
        <Text className="text-2xl font-black text-white">Vibe</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, gap: 12 }}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <Text className="text-zinc-500 text-base">Henüz paylaşılan vibe yok</Text>
              <Text className="text-zinc-600 text-xs mt-1">İlk gönderiyi sen oluştur!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/vibe/${item.id}` as any)}
              className="rounded-2xl border border-zinc-900 bg-zinc-900/60 p-4 active:bg-zinc-900"
            >
              <View className="flex-row items-start gap-3">
                {item.author_avatar ? (
                  <Image
                    source={{ uri: item.author_avatar }}
                    className="h-10 w-10 rounded-full bg-zinc-800"
                  />
                ) : (
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                    <Text className="text-sm font-bold text-white">
                      {item.author_name.slice(0, 1)}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="font-semibold text-zinc-300 text-sm">{item.author_name}</Text>
                  <Text className="text-lg font-bold text-white mt-1">{item.title}</Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    {item.location_tag ? (
                      <View className="flex-row items-center gap-1 rounded bg-zinc-800 px-2 py-0.5">
                        <MapPin size={11} color="#a1a1aa" />
                        <Text className="text-xs text-zinc-400">{item.location_tag}</Text>
                      </View>
                    ) : null}
                    <Text className="text-xs text-zinc-500">
                      {formatRelativeTr(item.created_at)}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Floating Create Button */}
      <Pressable
        onPress={() => setModalOpen(true)}
        className="absolute bottom-24 right-5 h-14 w-14 items-center justify-center rounded-full bg-violet-600 active:bg-violet-700 shadow-xl"
      >
        <Plus size={26} color="#ffffff" />
      </Pressable>

      {/* Create Post Modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable
            onPress={() => setModalOpen(false)}
            className="flex-1 bg-black/60 justify-end"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-6 pb-12"
            >
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-white">Yeni Vibe Paylaş</Text>
              <Pressable
                onPress={() => setModalOpen(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-zinc-900"
              >
                <X size={18} color="#a1a1aa" />
              </Pressable>
            </View>

            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Başlık
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Aklından geçen vibe nedir?"
              placeholderTextColor="#71717a"
              className="h-12 rounded-xl bg-zinc-900 px-4 text-white mb-4 border border-zinc-800"
            />

            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Konum Etiketi
            </Text>
            <TextInput
              value={loc}
              onChangeText={setLoc}
              placeholder="Örn: Kadıköy Moda Sahili"
              placeholderTextColor="#71717a"
              className="h-12 rounded-xl bg-zinc-900 px-4 text-white mb-6 border border-zinc-800"
            />

            <Pressable
              onPress={createPost}
              disabled={posting || !title.trim()}
              className="h-13 items-center justify-center rounded-2xl bg-violet-600 active:bg-violet-700"
            >
              {posting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-bold text-white">Paylaş</Text>
              )}
            </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
