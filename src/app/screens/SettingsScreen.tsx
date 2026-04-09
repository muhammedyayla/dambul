import { useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  Globe,
  Bell,
  MapPin,
  RotateCcw,
  HelpCircle,
  Mail,
  FileText,
  Shield,
  Users,
  Smartphone,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Separator } from "../components/ui/separator";
import { currentUser } from "../data/currentUser";
import { setAuthed } from "../auth";
import { cn } from "../components/ui/utils";

const SEE_OPTIONS = ["Kadınlar", "Erkekler", "Herkes"] as const;
const DISTANCE_STOPS = [
  { label: "Min", km: 1 },
  { label: "25 km", km: 25 },
  { label: "50 km", km: 50 },
  { label: "100 km", km: 100 },
  { label: "Max", km: 200 },
] as const;

const PERSONALITY = [
  {
    title: "Mizahın?",
    left: "Alaycı",
    mid: "Karışık",
    right: "Pozitif",
  },
  {
    title: "Enerji seviyen",
    left: "İçe dönük",
    mid: "Dengeli",
    right: "Dışa dönük",
  },
  {
    title: "Yaşam tarzın",
    left: "Güvenli ve rahat",
    mid: "Orta",
    right: "Maceracı ve riskli",
  },
  {
    title: "İlk adımı kim atar?",
    left: "Ben atarım",
    mid: "Herhangi biri",
    right: "Beklerim",
  },
  {
    title: "Aşk dilin ne?",
    left: "Kelime aşığı",
    mid: "Hediye bağımlısı",
    right: "Dokunma arayıcı",
  },
  {
    title: "İdeal hafta sonun?",
    left: "Evde chill",
    mid: "Arkadaşlarla dışarı",
    right: "Macera modu",
  },
] as const;

function PreferenceCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-[min(88vw,300px)] shrink-0 snap-center rounded-2xl border border-border bg-card p-4",
        className,
      )}
    >
      <p className="mb-3 text-sm font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function PersonalityBar({
  title,
  left,
  mid,
  right,
  value,
  onChange,
}: {
  title: string;
  left: string;
  mid: string;
  right: string;
  value: number[];
  onChange: (v: number[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <Slider
        value={value}
        onValueChange={onChange}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between gap-1 text-[11px] leading-tight text-muted-foreground">
        <span className="max-w-[32%] text-left">{left}</span>
        <span className="max-w-[34%] text-center">{mid}</span>
        <span className="max-w-[32%] text-right">{right}</span>
      </div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  right,
  onClick,
  destructive,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  right?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Icon
          className={cn(
            "size-5 shrink-0",
            destructive ? "text-destructive" : "text-muted-foreground",
          )}
        />
        <span
          className={cn(
            "truncate text-base",
            destructive && "font-medium text-destructive",
          )}
        >
          {label}
        </span>
      </div>
      {right != null ? <div className="shrink-0">{right}</div> : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left transition-colors hover:bg-muted/40"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3.5">{content}</div>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const lang = localStorage.getItem("dambul_lang") ?? "tr";
  const langLabel =
    lang === "en" ? "English" : lang === "de" ? "Deutsch" : "Türkçe";

  const [seeIndex, setSeeIndex] = useState(2);
  const [ageRange, setAgeRange] = useState([22, 45]);
  const [distanceIndex, setDistanceIndex] = useState(2);
  const [heightCm, setHeightCm] = useState([175]);

  const [personality, setPersonality] = useState(() =>
    PERSONALITY.map(() => [50] as number[]),
  );

  const [haptics, setHaptics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showOnMap, setShowOnMap] = useState(true);

  const updatePersonality = (i: number, v: number[]) => {
    setPersonality((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  };

  const logout = () => {
    setAuthed(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-10 text-foreground">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate("/map")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold">Ayarlar</h1>
      </header>

      {/* 1. Profil fotoğrafı */}
      <section className="flex flex-col items-center px-4 pt-8">
        <div className="size-36 overflow-hidden rounded-full border-4 border-border ring-2 ring-accent/40">
          <img
            src={currentUser.photo}
            alt=""
            className="size-full object-cover"
          />
        </div>
      </section>

      {/* 2. Profil bilgileri */}
      <section className="mt-8 px-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Profil bilgileri
        </h2>
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">İsim</span>
            <span className="font-medium">{currentUser.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Yaş</span>
            <span className="font-medium">{currentUser.age}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cinsiyet</span>
            <span className="font-medium">{currentUser.gender}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bio</span>
            <span className="max-w-[60%] text-right font-medium line-clamp-2">
              {currentUser.bio}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Tercihler — yatay kaydırma */}
      <section className="mt-10 px-0">
        <h2 className="mb-3 px-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tercihler
        </h2>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 pt-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <PreferenceCard title="Görmek istiyorum">
            <div className="flex flex-col gap-2">
              {SEE_OPTIONS.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSeeIndex(i)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    seeIndex === i
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-muted/30 text-foreground hover:bg-muted/50",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </PreferenceCard>

          <PreferenceCard title="Yaş aralığı">
            <p className="mb-2 text-xs text-muted-foreground">
              {ageRange[0]} – {ageRange[1]} yaş
            </p>
            <Slider
              value={ageRange}
              onValueChange={(v) => setAgeRange(v as number[])}
              min={18}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>18</span>
              <span>100</span>
            </div>
          </PreferenceCard>

          <PreferenceCard title="Mesafe">
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {DISTANCE_STOPS.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDistanceIndex(i)}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                    distanceIndex === i
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-muted/30 hover:bg-muted/50",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </PreferenceCard>

          <PreferenceCard title="Boy">
            <p className="mb-2 text-xs text-muted-foreground">
              {heightCm[0]} cm
            </p>
            <Slider
              value={heightCm}
              onValueChange={(v) => setHeightCm(v as number[])}
              min={130}
              max={230}
              step={1}
              className="w-full"
            />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>130 cm</span>
              <span>230 cm</span>
            </div>
          </PreferenceCard>
        </div>
      </section>

      {/* 4. Personality */}
      <section className="mt-10 px-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Personality
        </h2>
        <div className="space-y-6 rounded-2xl border border-border bg-card p-4">
          {PERSONALITY.map((p, i) => (
            <PersonalityBar
              key={p.title}
              title={p.title}
              left={p.left}
              mid={p.mid}
              right={p.right}
              value={personality[i] ?? [50]}
              onChange={(v) => updatePersonality(i, v)}
            />
          ))}
        </div>
      </section>

      {/* 5. Ayarlar listesi */}
      <section className="mt-10 px-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ayarlar
        </h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
          <SettingsRow
            icon={Glob}
            label="Dilim"
            onClick={() => navigate("/settings/language")}
            right={
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                {langLabel}
                <ChevronRight className="size-4" />
              </span>
            }
          />
          <SettingsRow
            icon={Smartphone}
            label="Titreme"
            right={
              <Switch checked={haptics} onCheckedChange={setHaptics} />
            }
          />
          <SettingsRow
            icon={Bell}
            label="Bildirimler"
            right={
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            }
          />
          <SettingsRow
            icon={MapPin}
            label="Beni haritada göster"
            right={
              <Switch checked={showOnMap} onCheckedChange={setShowOnMap} />
            }
          />
          <SettingsRow
            icon={RotateCcw}
            label="Satın Alımları Geri Yükle"
            onClick={() => {}}
            right={<ChevronRight className="size-4 text-muted-foreground" />}
          />
          <SettingsRow
            icon={HelpCircle}
            label="SSS"
            onClick={() => {}}
            right={<ChevronRight className="size-4 text-muted-foreground" />}
          />
          <SettingsRow
            icon={Mail}
            label="İletişim"
            onClick={() => {}}
            right={<ChevronRight className="size-4 text-muted-foreground" />}
          />
          <SettingsRow
            icon={FileText}
            label="Terimler"
            onClick={() => {}}
            right={<ChevronRight className="size-4 text-muted-foreground" />}
          />
          <SettingsRow
            icon={Shield}
            label="Mahremiyet"
            onClick={() => {}}
            right={<ChevronRight className="size-4 text-muted-foreground" />}
          />
          <SettingsRow
            icon={Users}
            label="Topluluk Kuralları"
            onClick={() => {}}
            right={<ChevronRight className="size-4 text-muted-foreground" />}
          />
          <SettingsRow
            icon={LogOut}
            label="Çıkış Yap"
            destructive
            onClick={logout}
          />
        </div>
      </section>
    </div>
  );
}
