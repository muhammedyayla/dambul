import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRevalidator } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Slider } from "../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { apiPatch, API_BASE } from "../api";
import { cn } from "../components/ui/utils";
import { ScrollArea } from "../components/ui/scroll-area";
import { PersonalitySliders, barsToDb } from "../components/PersonalitySliders";

const MAP_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ""; // Mapbox token from environment

type MapPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

async function searchPlaces(query: string): Promise<MapPlace[]> {
  if (!MAP_TOKEN.trim() || query.trim().length < 2) return [];
  const q = encodeURIComponent(query.trim());
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${MAP_TOKEN}&types=place,locality,region,district&country=TR&limit=8&autocomplete=true&language=tr`
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    features?: { id: string; place_name?: string; text?: string; center: [number, number] }[];
  };
  return (data.features || []).map((f) => ({
    id: f.id,
    name: f.place_name || f.text || "",
    lng: f.center[0],
    lat: f.center[1],
  }));
}

/** barsToDb is now imported from PersonalitySliders */

function ageToBirthDate(age: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function OnboardingScreen() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [name, setName] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [cityPick, setCityPick] = useState<MapPlace | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<MapPlace[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [age, setAge] = useState([25]);
  const [heightCm, setHeightCm] = useState([170]);
  const [prefGender, setPrefGender] = useState<string>("");
  const [bio, setBio] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [personality, setPersonality] = useState({
    personality_humor: 50,
    personality_energy: 50,
    personality_lifestyle: 50,
    personality_first_step: 50,
    personality_love_language: 50,
    personality_weekend: 50,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onCityInput = useCallback((v: string) => {
    setCityInput(v);
    setCityPick(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      const list = await searchPlaces(v);
      setCitySuggestions(list);
      setCityOpen(list.length > 0);
    }, 280);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const pickCity = (p: MapPlace) => {
    setCityPick(p);
    setCityInput(p.name);
    setCityOpen(false);
    setCitySuggestions([]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!file) {
      setErr("Profil fotoğrafı yükleyin.");
      return;
    }
    if (!name.trim()) {
      setErr("İsim zorunludur.");
      return;
    }
    if (!cityPick) {
      setErr("Listeden bir şehir seçin (yazdıkça önerilerden dokunun).");
      return;
    }
    if (!prefGender) {
      setErr("İlgilendiğiniz cinsiyeti seçin.");
      return;
    }
    const a = age[0];
    if (a < 18 || a > 100) {
      setErr("Yaş 18–100 arası olmalıdır.");
      return;
    }
    const h = heightCm[0];
    if (h < 130 || h > 230) {
      setErr("Boy 130–230 cm arası olmalıdır.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const up = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!up.ok) {
        let msg = "Fotoğraf yüklenemedi.";
        try {
          const j = (await up.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const { url: avatar_url } = (await up.json()) as { url: string };

      const prefMap =
        prefGender === "Kadınlar" ? "female" : prefGender === "Erkekler" ? "male" : "everyone";

      await apiPatch("/api/users/me", {
        name: name.trim(),
        city: cityPick.name,
        lat: cityPick.lat,
        lng: cityPick.lng,
        birth_date: ageToBirthDate(a),
        height: h,
        pref_gender: prefMap,
        bio: bio.trim() || null,
        avatar_url,
        tags: [],
        ...personality,
      });
      revalidator.revalidate();
      navigate("/map");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Kayıt başarısız. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 pb-24 text-zinc-100">
      <h1 className="mb-2 text-2xl font-bold">Profilini tamamla</h1>
      {/* <p className="mb-6 text-sm text-zinc-400">
        Zorunlu alanlar işaretli. Hakkında isteğe bağlıdır.
      </p> */}
      <ScrollArea className="h-[calc(100vh-8rem)] pr-3">
        <form onSubmit={onSubmit} className="space-y-6">
          <p className="text-sm font-medium text-violet-300">Zorunlu</p>

          <div className="space-y-2">
            <Label>Profil fotoğrafı</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f ?? null);
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
            {preview ? (
              <img src={preview} alt="" className="mt-2 h-32 w-32 rounded-2xl object-cover" />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>İsim</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-900" />
          </div>

          <div className="relative space-y-2">
            <Label>Şehir / il (yazın ve listeden seçin)</Label>
            <Input
              value={cityInput}
              onChange={(e) => onCityInput(e.target.value)}
              onFocus={() => citySuggestions.length > 0 && setCityOpen(true)}
              className="bg-zinc-900"
              placeholder="Örn: İstanbul, Ankara…"
              autoComplete="off"
            />
            {!MAP_TOKEN.trim() ? (
              <p className="text-xs text-amber-500">Şehir araması için .env içinde map_box_token gerekir.</p>
            ) : null}
            {cityOpen && citySuggestions.length > 0 ? (
              <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                {citySuggestions.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800"
                      onClick={() => pickCity(p)}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {cityPick ? (
              <p className="text-xs text-emerald-500">Seçildi: {cityPick.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Yaş: {age[0]}</Label>
            <Slider
              value={age}
              onValueChange={setAge}
              min={18}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Boy: {heightCm[0]} cm</Label>
            <Slider
              value={heightCm}
              onValueChange={setHeightCm}
              min={130}
              max={230}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>İlgilendiğim cinsiyet</Label>
            <Select value={prefGender} onValueChange={setPrefGender}>
              <SelectTrigger className="bg-zinc-900">
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kadınlar">Kadınlar</SelectItem>
                <SelectItem value="Erkekler">Erkekler</SelectItem>
                <SelectItem value="Herkes">Herkes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="pt-2 text-sm font-medium text-zinc-500">Opsiyonel</p>
          <div className="space-y-2">
            <Label>Hakkında</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-zinc-900"
              rows={3}
              placeholder="İsterseniz kendinizi anlatın"
            />
          </div>

          <PersonalitySliders 
            values={personality} 
            onChange={(key, val) => setPersonality(p => ({ ...p, [key]: val }))} 
          />

          {err ? <p className="text-sm text-rose-400">{err}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kaydediliyor…" : "Devam et"}
          </Button>
        </form>
      </ScrollArea>
    </div>
  );
}

/** 20 çubuk; 0…value dolu (sola sıfırdan, sağa seçim). value 0–19. */
function BarScale20({
  label,
  left,
  right,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-zinc-500">
        <span className="max-w-[30%]">{left}</span>
        <span className="font-medium text-zinc-300">{label}</span>
        <span className="max-w-[30%] text-right">{right}</span>
      </div>
      <div className="flex gap-px sm:gap-0.5">
        {Array.from({ length: 20 }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}`}
            onClick={() => onChange(i)}
            className={cn(
              "h-9 min-w-0 flex-1 rounded-sm border border-zinc-800 transition-colors",
              i <= value ? "bg-violet-600" : "bg-zinc-800/80"
            )}
          />
        ))}
      </div>
      {/* <p className="text-center text-[10px] text-zinc-600">
        {value + 1}. çubuk (orta yakın: 10) · kayıt: {barsToDb(value)}/100
      </p> */}
    </div>
  );
}
