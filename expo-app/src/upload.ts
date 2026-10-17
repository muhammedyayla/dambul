import * as ImagePicker from "expo-image-picker";
import { apiPost } from "./api";

export type UploadedPhoto = {
  url: string;
  public_id: string | null;
};

function mimeFromAsset(asset: ImagePicker.ImagePickerAsset): string {
  const raw = (asset.mimeType || "").toLowerCase();
  if (raw === "image/jpg") return "image/jpeg";
  if (raw.startsWith("image/")) return raw;
  const name = (asset.fileName || asset.uri).split("?")[0];
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "heic" || ext === "heif") return "image/heic";
  return "image/jpeg";
}

export async function uploadImageAsset(
  asset: ImagePicker.ImagePickerAsset
): Promise<UploadedPhoto> {
  if (asset.base64) {
    return apiPost<UploadedPhoto>("/api/upload", {
      image_base64: asset.base64,
      mime: mimeFromAsset(asset),
    });
  }

  const uri = asset.uri;
  const filename = (asset.fileName || uri.split("/").pop() || "photo.jpg").replace(
    /[^\w.\-]+/g,
    "_"
  );
  const safeName = filename.includes(".") ? filename : `${filename}.jpg`;
  const formData = new FormData();
  formData.append("photo", {
    uri,
    name: safeName,
    type: mimeFromAsset(asset),
  } as any);
  return apiPost<UploadedPhoto>("/api/upload", formData);
}

export async function uploadImageFromUri(uri: string): Promise<UploadedPhoto> {
  return uploadImageAsset({ uri } as ImagePicker.ImagePickerAsset);
}

export async function pickAndUploadPhoto(): Promise<UploadedPhoto | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error("Galeri izni gereklidir.");
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
    base64: true,
    exif: false,
  });

  if (res.canceled || !res.assets?.[0]) return null;
  return uploadImageAsset(res.assets[0]);
}
