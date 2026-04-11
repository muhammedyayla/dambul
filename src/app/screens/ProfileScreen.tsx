import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ChevronToMap } from "../components/ChevronToMap";
import { apiGet, apiPost } from "../api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

type Qa = { q: string; a: string };

type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  height: number | null;
  bio: string | null;
  tags: unknown;
  age: number | null;
  personality_humor: number;
  personality_energy: number;
  personality_lifestyle: number;
  personality_first_step: number;
  personality_love_language: number;
  personality_weekend: number;
  extra_photos: unknown;
  abstract_qa: unknown;
};

function Bar({
  label,
  value,
  left,
  mid,
  right,
}: {
  label: string;
  value: number;
  left: string;
  mid: string;
  right: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">{label}</p>
      <div className="flex justify-between text-[10px] text-zinc-500">
        <span className="max-w-[28%] text-left">{left}</span>
        <span className="max-w-[36%] text-center">{mid}</span>
        <span className="max-w-[28%] text-right">{right}</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

export function ProfileScreen() {
  const { userId } = useParams<{ userId: string }>();
  const [p, setP] = useState<Profile | null>(null);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        const prof = await apiGet<Profile>(`/api/users/${userId}`);
        setP(prof);
        await apiPost("/api/profile-views", { viewed_id: userId });
      } catch {
        /* ignore */
      }
    })();
  }, [userId]);

  if (!p) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        Yükleniyor…
      </div>
    );
  }

  const tags = Array.isArray(p.tags) ? (p.tags as string[]) : [];
  const extras = Array.isArray(p.extra_photos) ? (p.extra_photos as string[]) : [];
  const qaList: Qa[] = Array.isArray(p.abstract_qa) ? (p.abstract_qa as Qa[]) : [];

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      <ChevronToMap to="back" />
      <div className="pt-14">
        {p.avatar_url ? (
          <img src={p.avatar_url} alt="" className="aspect-[4/5] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center bg-zinc-800 text-6xl font-bold">
            {p.name.slice(0, 1)}
          </div>
        )}
      </div>

      <div className="space-y-6 px-4 py-6">
        <div>
          <h1 className="text-3xl font-bold">
            {p.name}
            {p.age != null ? `, ${p.age}` : ""}
          </h1>
          <p className="text-zinc-400">{p.city || ""}</p>
          {p.height ? <p className="text-sm text-zinc-500">{p.height} cm</p> : null}
        </div>

        {p.bio ? <p className="leading-relaxed text-zinc-300">{p.bio}</p> : null}

        {extras.slice(0, 1).map((url) => (
          <img key={url} src={url} alt="" className="w-full rounded-2xl object-cover" />
        ))}

        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>

        {extras.slice(1).map((url) => (
          <img key={url} src={url} alt="" className="w-full rounded-2xl object-cover" />
        ))}

        {qaList.length > 0 ? (
          <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="font-semibold text-violet-300">Soyut röportaj</h2>
            {qaList.map((q, i) => (
              <div key={i}>
                <p className="text-xs text-zinc-500">{q.q}</p>
                <p className="mt-1 text-sm">{q.a}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="font-semibold text-violet-300">Kişilik</h2>
          <Bar
            label="Mizahın?"
            value={p.personality_humor}
            left="Alaycı"
            mid="Karışık"
            right="Pozitif"
          />
          <Bar
            label="Enerji seviyen"
            value={p.personality_energy}
            left="İçe dönük"
            mid="Dengeli"
            right="Dışa dönük"
          />
          <Bar
            label="Yaşam tarzın"
            value={p.personality_lifestyle}
            left="Güvenli ve rahat"
            mid="Orta"
            right="Maceracı ve riskli"
          />
          <Bar
            label="İlk adımı kim atar?"
            value={p.personality_first_step}
            left="Ben atarım"
            mid="Herhangi biri"
            right="Beklerim"
          />
          <Bar
            label="Aşk dilin ne?"
            value={p.personality_love_language}
            left="Kelime aşığı"
            mid="Hediye bağımlısı"
            right="Dokunma arayıcı"
          />
          <Bar
            label="İdeal hafta sonun?"
            value={p.personality_weekend}
            left="Evde chill"
            mid="Arkadaşlarla dışarı"
            right="Macera modu"
          />
        </div>

        <div className="flex gap-3 pb-8">
          <Button variant="outline" className="flex-1" type="button" onClick={() => alert("Engelle (demo)")}>
            Engelle
          </Button>
          <Button variant="outline" className="flex-1" type="button" onClick={() => alert("Şikayet (demo)")}>
            Şikayet
          </Button>
        </div>
      </div>
    </div>
  );
}
