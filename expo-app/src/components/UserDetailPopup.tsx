import React from "react";
import { View, Text, Image, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import type { UserPreview } from "./UserBottomSheet";

interface UserDetailPopupProps {
  user: UserPreview | null;
  visible: boolean;
  onClose: () => void;
}

export function UserDetailPopup({ user, visible, onClose }: UserDetailPopupProps) {
  const router = useRouter();

  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/70 items-center justify-center p-6">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        >
          {/* Close button */}
          <Pressable
            onPress={onClose}
            className="absolute top-4 right-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-zinc-950/80"
          >
            <X size={20} color="#ffffff" />
          </Pressable>

          {/* Photo */}
          <View className="h-72 w-full bg-zinc-800">
            {user.photo ? (
              <Image source={{ uri: user.photo }} className="h-full w-full object-cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-5xl font-bold text-zinc-600">{user.name.slice(0, 1)}</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View className="p-6">
            <Text className="text-2xl font-black text-white">{user.name}</Text>
            <Text className="text-zinc-400 mt-1">
              {user.age ? `${user.age} yaşında` : ""}
              {user.gender ? ` • ${user.gender}` : ""}
            </Text>
            {user.bio ? (
              <Text numberOfLines={3} className="mt-3 text-sm text-zinc-300">
                {user.bio}
              </Text>
            ) : null}

            <Pressable
              onPress={() => {
                onClose();
                router.push(`/profile/${user.id}` as any);
              }}
              className="mt-6 h-12 items-center justify-center rounded-2xl bg-violet-600 active:bg-violet-700"
            >
              <Text className="font-semibold text-white">Detaylı Profil</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
