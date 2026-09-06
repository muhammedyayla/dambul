import React from "react";
import { View, Text, Image, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { X, MapPin } from "lucide-react-native";

export type UserPreview = {
  id: string;
  name: string;
  age?: number | null;
  gender?: string | null;
  bio?: string | null;
  photo?: string | null;
  city?: string | null;
};

interface UserBottomSheetProps {
  user: UserPreview | null;
  visible: boolean;
  onClose: () => void;
}

export function UserBottomSheet({ user, visible, onClose }: UserBottomSheetProps) {
  const router = useRouter();

  if (!user) return null;

  const handleViewProfile = () => {
    onClose();
    router.push(`/profile/${user.id}` as any);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/60 justify-end">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-6 pb-10 max-h-[75%]"
        >
          {/* Handle bar */}
          <View className="items-center pb-4">
            <View className="h-1.5 w-12 rounded-full bg-zinc-700" />
          </View>

          {/* Close button */}
          <Pressable
            onPress={onClose}
            className="absolute top-6 right-6 h-10 w-10 items-center justify-center rounded-full bg-zinc-800"
          >
            <X size={20} color="#ffffff" />
          </Pressable>

          {/* Header */}
          <View className="flex-row items-center gap-4 mb-5">
            {user.photo ? (
              <Image source={{ uri: user.photo }} className="h-20 w-20 rounded-2xl bg-zinc-800" />
            ) : (
              <View className="h-20 w-20 rounded-2xl bg-zinc-800 items-center justify-center">
                <Text className="text-2xl font-bold text-zinc-400">{user.name.slice(0, 1)}</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-2xl font-black text-white">{user.name}</Text>
              <Text className="text-zinc-400 mt-0.5">
                {user.age ? `${user.age} yaşında` : ""}
                {user.gender ? ` • ${user.gender}` : ""}
              </Text>
            </View>
          </View>

          {/* Bio */}
          {user.bio ? (
            <View className="mb-5">
              <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Hakkında
              </Text>
              <Text className="text-sm text-zinc-300 leading-relaxed">{user.bio}</Text>
            </View>
          ) : null}

          {/* Location */}
          <View className="flex-row items-center gap-2 mb-6">
            <MapPin size={16} color="#a1a1aa" />
            <Text className="text-sm text-zinc-400">{user.city || "Konum belirtilmedi"}</Text>
          </View>

          {/* Action buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleViewProfile}
              className="flex-1 h-14 items-center justify-center rounded-2xl bg-zinc-800 active:bg-zinc-700"
            >
              <Text className="font-semibold text-white">Profili Gör</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="flex-1 h-14 items-center justify-center rounded-2xl bg-violet-600 active:bg-violet-700"
            >
              <Text className="font-semibold text-white">Bağlan</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
