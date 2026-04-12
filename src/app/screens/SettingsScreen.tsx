import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import { ChevronToMap } from "../components/ChevronToMap";
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
      <ChevronToMap />
      <ScrollArea className="h-screen pt-14">
        <div className="space-y-8 px-4 pb-24">
          <div>
            <h1 className="text-2xl font-bold">Ayarlar</h1>
            <p className="text-sm text-zinc-500">Profil ve tercihler</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              className="relative size-28 overflow-hidden rounded-full border-2 border-zinc-700"
              onClick={() => document.getElementById("avatar-input")?.click()}
            >
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-3xl">{u.name.slice(0, 1)}</span>
              )}
            </button>
            <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={(e) => void uploadPhoto(e)} />
            <p className="text-xs text-zinc-500">Fotoğrafa dokun — yeni yükle</p>
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
            <h2 className="font-semibold">Kişilik (düzenle)</h2>
            <PersonEdit label="Mizah" v={u.personality_humor} onChange={(n) => void patch({ personality_humor: n })} />
            <PersonEdit label="Enerji" v={u.personality_energy} onChange={(n) => void patch({ personality_energy: n })} />
            <PersonEdit
              label="Yaşam"
              v={u.personality_lifestyle}
              onChange={(n) => void patch({ personality_lifestyle: n })}
            />
            <PersonEdit
              label="İlk adım"
              v={u.personality_first_step}
              onChange={(n) => void patch({ personality_first_step: n })}
            />
            <PersonEdit
              label="Aşk dili"
              v={u.personality_love_language}
              onChange={(n) => void patch({ personality_love_language: n })}
            />
            <PersonEdit
              label="Hafta sonu"
              v={u.personality_weekend}
              onChange={(n) => void patch({ personality_weekend: n })}
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

function PersonEdit({
  label,
  v,
  onChange,
}: {
  label: string;
  v: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Slider value={[v]} onValueChange={([n]) => onChange(n)} max={100} step={1} className="mt-2" />
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
