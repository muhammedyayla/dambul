import { useEffect, useState } from "react";
import { Camera, ChevronDown, ChevronRight, CircleAlert, Pencil, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { apiGet, apiPatch, apiPost, API_BASE } from "../api";
import type { SessionUser } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { PersonalitySliders } from "../components/PersonalitySliders";

export function SettingsScreen() {
  const navigate = useNavigate();
  const [u, setU] = useState<SessionUser | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [height, setHeight] = useState("");

  useEffect(() => {
    void (async () => {
      const me = await apiGet<SessionUser>("/api/auth/me");
      setU(me);
      setName(me.name);
      setCity(me.city || "");
      setHeight(me.height != null ? String(me.height) : "");
    })();
  }, []);

  const patch = async (body: Record<string, unknown>) => {
    const next = await apiPatch<SessionUser>("/api/users/me", body);
    setU(next);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("photo", f);
    const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: fd, credentials: "include" });
    if (!res.ok) return;
    const { url } = (await res.json()) as { url: string };
    await patch({ avatar_url: url });
  };

  const saveBasics = async () => {
    const h = parseInt(height, 10);
    await patch({
      name: name.trim(),
      city: city.trim() || null,
      height: Number.isNaN(h) ? null : h,
    });
  };

  const logout = async () => {
    await apiPost("/api/auth/logout", {});
    navigate("/login");
  };

  if (!u) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        Yükleniyor…
      </div>
    );
  }

  const prefGenderLabel =
    u.pref_gender === "female" ? "Kadınlar" : u.pref_gender === "male" ? "Erkekler" : "Herkes";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed top-0 z-50 flex w-full max-w-md items-center justify-between bg-zinc-950/80 px-4 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold">Ayarlar</h1>
          <p className="text-xs text-zinc-500">Profil ve tercihler</p>
        </div>
        <Link to="/map" className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white">
          <ChevronDown className="size-6" />
        </Link>
      </div>

      <ScrollArea className="h-screen pt-20">
        <div className="space-y-8 px-4 pb-24">
          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="relative">
              {/* Photo Area with organic blob */}
              <div
                className="relative size-36 overflow-hidden bg-zinc-800 shadow-2xl transition-all"
                style={{ borderRadius: "60% 40% 55% 45% / 55% 45% 60% 40%" }}
              >
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-4xl font-bold text-zinc-600">
                    {u.name.slice(0, 1)}
                  </span>
                )}
              </div>

              {/* + Icons at 12, 10, 2 o'clock - All triggering the sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <button type="button" className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 p-1.5 text-white shadow-lg hover:scale-110 transition-transform">
                    <Plus className="size-4" />
                  </button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <button type="button" className="absolute left-[5%] top-[15%] rounded-full bg-violet-600 p-1.5 text-white shadow-lg hover:scale-110 transition-transform">
                    <Plus className="size-4" />
                  </button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <button type="button" className="absolute right-[5%] top-[15%] rounded-full bg-violet-600 p-1.5 text-white shadow-lg hover:scale-110 transition-transform">
                    <Plus className="size-4" />
                  </button>
                </SheetTrigger>

                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="absolute -bottom-3 -right-2 rounded-full bg-violet-600 p-3 text-white shadow-xl hover:scale-110 transition-transform"
                  >
                    <Camera className="size-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl border-zinc-800 bg-zinc-950 p-0 overflow-hidden">
                  <PhotoManagementSheet user={u} onUpdate={setU} />
                </SheetContent>
              </Sheet>

              {/* Bottom icons */}
              <button
                type="button"
                className="absolute -bottom-1 -left-2 rounded-full bg-zinc-900 p-2 text-zinc-400 shadow-xl border border-zinc-800"
                onClick={() => alert("Bio/İsim düzenle (demo)")}
              >
                <Pencil className="size-4" />
              </button>
            </div>

            <div className="w-full space-y-3 text-center">
              <h2 className="text-2xl font-bold">{u.name}</h2>
              <div className="mx-auto max-w-[240px] space-y-2">
                <div className="flex justify-between text-xs font-medium text-zinc-400">
                  <span>Profil tamamlandı</span>
                  <span className="text-violet-400">%{u.completionPercent ?? 0}</span>
                </div>
                <Progress value={u.completionPercent ?? 0} className="h-1.5 bg-zinc-900" />
              </div>

              {u.missingPhotosCount && u.missingPhotosCount > 0 ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-[13px] text-amber-500 border border-amber-500/20 max-w-[320px] mx-auto animate-pulse">
                  <CircleAlert className="size-4" />
                  <p>Arama sonuçlarında daha iyi görünürlük için {u.missingPhotosCount} fotoğraf daha ekleyin</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>İsim</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-900" />
            </div>
            <div>
              <Label>Şehir</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-zinc-900" />
            </div>
            <div>
              <Label>Boy (cm)</Label>
              <Input value={height} onChange={(e) => setHeight(e.target.value)} className="bg-zinc-900" />
            </div>
            <Button onClick={() => void saveBasics()}>Kaydet</Button>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-4">
            <h2 className="font-semibold">Tercihler</h2>
            <div>
              <Label>Görmek istiyorum</Label>
              <Select
                value={prefGenderLabel}
                onValueChange={(v) => {
                  const map =
                    v === "Kadınlar" ? "female" : v === "Erkekler" ? "male" : "everyone";
                  void patch({ pref_gender: map });
                }}
              >
                <SelectTrigger className="bg-zinc-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kadınlar">Kadınlar</SelectItem>
                  <SelectItem value="Erkekler">Erkekler</SelectItem>
                  <SelectItem value="Herkes">Herkes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Yaş aralığı: {u.pref_age_min} – {u.pref_age_max}
              </Label>
              <Slider
                value={[u.pref_age_min, u.pref_age_max]}
                onValueChange={([a, b]) => void patch({ pref_age_min: a, pref_age_max: b })}
                min={18}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Mesafe (km): {u.pref_distance_km}</Label>
              <Select
                value={String(u.pref_distance_km)}
                onValueChange={(v) => void patch({ pref_distance_km: parseInt(v, 10) })}
              >
                <SelectTrigger className="bg-zinc-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Yakın</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                  <SelectItem value="300">Maksimum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Boy tercihi: {u.pref_height_min} – {u.pref_height_max} cm
              </Label>
              <Slider
                value={[u.pref_height_min, u.pref_height_max]}
                onValueChange={([a, b]) => void patch({ pref_height_min: a, pref_height_max: b })}
                min={130}
                max={230}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-4">
            <h2 className="font-semibold">Kişilik</h2>
            <PersonalitySliders
              values={{
                personality_humor: u.personality_humor,
                personality_energy: u.personality_energy,
                personality_lifestyle: u.personality_lifestyle,
                personality_first_step: u.personality_first_step,
                personality_love_language: u.personality_love_language,
                personality_weekend: u.personality_weekend
              }}
              onChange={(key, val) => void patch({ [key]: val })}
            />
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-1">
            <Row title="Dilim" mock />
            <div className="flex items-center justify-between py-3">
              <span>Titreme</span>
              <Switch
                checked={u.vibration_enabled}
                onCheckedChange={(c) => void patch({ vibration_enabled: c })}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <span>Bildirimler</span>
              <Switch
                checked={u.notifications_enabled}
                onCheckedChange={(c) => void patch({ notifications_enabled: c })}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <span>Beni haritada göster</span>
              <Switch checked={u.show_on_map} onCheckedChange={(c) => void patch({ show_on_map: c })} />
            </div>
            <Row title="Satın Alımları Geri Yükle" mock />
            <Row title="SSS" mock />
            <Row title="İletişim" mock />
            <Row title="Terimler" mock />
            <Row title="Mahremiyet" mock />
            <Row title="Topluluk Kuralları" mock />
          </div>

          <Button variant="destructive" className="w-full" onClick={() => void logout()}>
            Çıkış Yap
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}

function PhotoManagementSheet({
  user,
  onUpdate
}: {
  user: SessionUser;
  onUpdate: (u: SessionUser) => void;
}) {
  const [photos, setPhotos] = useState<{ id: string; url: string; order_index: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPhotos = async () => {
    try {
      const phs = await apiGet<{ id: string; url: string; order_index: number }[]>(`/api/users/${user.id}/photos`);
      setPhotos(phs);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPhotos();
  }, [user.id]);

  const onUpload = async (slotIdx: number, existingId?: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (!f) return;

      try {
        const fd = new FormData();
        fd.append("photo", f);
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: fd,
          credentials: "include"
        });
        if (!res.ok) return;
        const { url } = (await res.json()) as { url: string };

        if (slotIdx === 0) {
          // Main Avatar
          const next = await apiPatch<SessionUser>("/api/users/me", { avatar_url: url });
          onUpdate(next);
        } else {
          // Extra Photos
          if (existingId) {
            // Delete old one first if replacing
            await fetch(`${API_BASE}/api/users/me/photos/${existingId}`, { method: "DELETE", credentials: "include" });
          }
          await apiPost("/api/users/me/photos", { url, order_index: slotIdx });
          void loadPhotos();
          // Update completion stats in main user object
          const me = await apiGet<SessionUser>("/api/auth/me");
          onUpdate(me);
        }
      } catch (err) {
        console.error("Upload error", err);
      }
    };
    input.click();
  };

  // Slot mapping: Slot 0 = Avatar. Slots 1-8 = user_photos by order_index.
  const slots = Array.from({ length: 9 }).map((_, i) => {
    if (i === 0) return { url: user.avatar_url, isMain: true };
    const p = photos.find(ph => ph.order_index === i);
    return { url: p?.url, id: p?.id, isMain: false };
  });

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <SheetHeader className="flex flex-row items-center justify-between border-b border-zinc-900 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📷</span>
          <SheetTitle className="text-lg font-bold text-zinc-100">Profil fotoğrafları</SheetTitle>
        </div>
        <SheetTrigger asChild>
          <button type="button" className="rounded-full bg-zinc-900 p-2 text-zinc-400">
            <ChevronDown className="size-5" />
          </button>
        </SheetTrigger>
      </SheetHeader>

      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-zinc-500">Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-3 grid-rows-3 gap-3 aspect-square max-w-md mx-auto">
            {/* Slot 0: Big Main Photo (2x2 span) */}
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group">
              {slots[0].url ? (
                <img src={slots[0].url} alt="" className="size-full object-cover" />
              ) : (
                <Plus className="size-8 text-zinc-700" />
              )}
              <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                Ana fotoğraf
              </div>
              <button
                onClick={() => void onUpload(0)}
                className="absolute bottom-3 right-3 rounded-full bg-violet-600 p-3 text-white shadow-xl hover:scale-110 transition-transform"
              >
                <Camera className="size-5" />
              </button>
            </div>

            {/* Other 8 slots */}
            {slots.slice(1).map((s, i) => (
              <div
                key={i + 1}
                className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group"
              >
                {s.url ? (
                  <>
                    <img src={s.url} alt="" className="size-full object-cover" />
                    <button
                      onClick={() => void onUpload(i + 1, s.id)}
                      className="absolute bottom-1 right-1 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-violet-600 transition-colors"
                    >
                      <Camera className="size-3" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => void onUpload(i + 1)}
                    className="flex size-full items-center justify-center hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="size-6 text-zinc-700" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}


function Row({ title, mock }: { title: string; mock?: boolean }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between py-3 text-left"
      onClick={() => mock && alert("Yakında")}
    >
      <span>{title}</span>
      <ChevronRight className="size-4 text-zinc-500" />
    </button>
  );
}
