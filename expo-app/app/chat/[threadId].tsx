import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Send } from "lucide-react-native";
import { apiGet, apiPost } from "../../src/api";

type Msg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function ChatThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    void (async () => {
      try {
        const u = await apiGet<{ id: string }>("/api/auth/me");
        setMe(u.id);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    if (!threadId) return;
    void (async () => {
      try {
        const list = await apiGet<Msg[]>(`/api/chat/${threadId}/messages`);
        setMessages(list);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [threadId]);

  const send = async () => {
    if (!threadId || !text.trim()) return;
    const body = text.trim();
    setText("");

    try {
      const m = await apiPost<Msg>(`/api/chat/${threadId}/messages`, { body });
      setMessages((prev) =>
        prev.some((x) => x.id === m.id)
          ? prev
          : [...prev, m].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
      );
    } catch {
      setText(body);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      {/* Header */}
      <View className="flex-row items-center border-b border-zinc-900 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-zinc-900 active:bg-zinc-800 mr-2"
        >
          <ChevronLeft size={22} color="#ffffff" />
        </Pressable>
        <Text className="text-lg font-bold text-white">Sohbet</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        className="flex-1"
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMe = item.sender_id === me;
              return (
                <View className={`flex-row ${isMe ? "justify-end" : "justify-start"}`}>
                  <View
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isMe ? "bg-violet-600 rounded-br-sm" : "bg-zinc-800 rounded-bl-sm"
                    }`}
                  >
                    <Text className="text-sm text-white leading-relaxed">{item.body}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input Bar */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="flex-row items-center gap-2 border-t border-zinc-900 px-3 pt-3 bg-zinc-950"
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Mesaj yaz..."
            placeholderTextColor="#71717a"
            className="flex-1 h-12 rounded-2xl bg-zinc-900 px-4 text-base text-white"
          />
          <Pressable
            onPress={send}
            disabled={!text.trim()}
            className={`h-12 w-12 items-center justify-center rounded-2xl ${
              text.trim() ? "bg-violet-600 active:bg-violet-700" : "bg-zinc-800"
            }`}
          >
            <Send size={18} color="#ffffff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
