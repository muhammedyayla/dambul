export type SessionUser = {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  height: number | null;
  gender: string | null;
  bio: string | null;
  tags: string[];
  personality_humor: number;
  personality_energy: number;
  personality_lifestyle: number;
  personality_first_step: number;
  personality_love_language: number;
  personality_weekend: number;
  show_on_map: boolean;
  pref_gender: string;
  pref_age_min: number;
  pref_age_max: number;
  pref_distance_km: number;
  pref_height_min: number;
  pref_height_max: number;
  vibration_enabled: boolean;
  notifications_enabled: boolean;
  birth_date: string | null;
  extra_photos: unknown;
  abstract_qa: unknown;
  email?: string | null;
  completionPercent?: number;
  missingPhotosCount?: number;
  preferred_gender?: string | null;
  languages?: string[] | null;
  looking_for?: string | null;
  personality_type?: string | null;
  alcohol_habit?: string | null;
  smoking_habit?: string | null;
  education_level?: string | null;
  family_plans?: string | null;
  communication_style?: string | null;
  pets?: string | null;
  zodiac_sign?: string | null;
  lifestyle_tags?: string[] | null;
  favorite_activities?: string[] | null;
  sports?: string[] | null;
};

export function profileComplete(u: SessionUser): boolean {
  return Boolean(u.city && u.lat != null && u.lng != null);
}

export type PersonalityKey =
  | "personality_humor"
  | "personality_energy"
  | "personality_lifestyle"
  | "personality_first_step"
  | "personality_love_language"
  | "personality_weekend";
