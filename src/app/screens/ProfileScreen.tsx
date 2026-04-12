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
  const [photos, setPhotos] = useState<{ url: string }[]>([]);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        const [prof, phs] = await Promise.all([
          apiGet<Profile>(`/api/users/${userId}`),
          apiGet<{ url: string }[]>(`/api/users/${userId}/photos`),
        ]);
        setP(prof);
        setPhotos(phs);
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
  const qaList: Qa[] = Array.isArray(p.abstract_qa) ? (p.abstract_qa as Qa[]) : [];

  // Use photos from user_photos table, fallback to avatar_url for first photo if empty
  const displayPhotos = photos.length > 0 ? photos : p.avatar_url ? [{ url: p.avatar_url }] : [];

  const renderInfoBlock = (index: number) => {
    if (index === 0) {
      // Info Block 1: Bio & Tags
      return (
        <div key="info-1" className="space-y-4 px-4">
          {p.bio ? <p className="leading-relaxed text-zinc-300">{p.bio}</p> : null}
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      );
    }
    if (index === 1 && qaList.length > 0) {
      // Info Block 2: Q&A
      return (
        <div key="info-2" className="mx-4 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="font-semibold text-violet-300">Soyut röportaj</h2>
          {qaList.map((q, i) => (
            <div key={i}>
              <p className="text-xs text-zinc-500">{q.q}</p>
              <p className="mt-1 text-sm">{q.a}</p>
            </div>
          ))}
        </div>
      );
    }
    if (index === 2) {
      // Info Block 3: Personality
      return (
        <div key="personality" className="mx-4 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="font-semibold text-violet-300">Kişilik</h2>
          <Bar label="Mizahın?" value={p.personality_humor} left="Alaycı" mid="Karışık" right="Pozitif" />
          <Bar label="Enerji seviyen" value={p.personality_energy} left="İçe dönük" mid="Dengeli" right="Dışa dönük" />
          <Bar label="Yaşam tarzın" value={p.personality_lifestyle} left="Güvenli" mid="Orta" right="Maceracı" />
          <Bar label="İlk adımı kim atar?" value={p.personality_first_step} left="Ben" mid="Herhangi" right="Beklerim" />
          <Bar label="Aşk dilin ne?" value={p.personality_love_language} left="Kelime" mid="Hediye" right="Dokunma" />
          <Bar label="İdeal hafta sonun?" value={p.personality_weekend} left="Evde" mid="Dışarı" right="Macera" />
        </div>
      );
    }
    return null;
  };

  const sections: React.ReactNode[] = [];
  let photoIdx = 0;
  let infoIdx = 0;

  // Pattern: 2 photos, 1 info block
  while (photoIdx < displayPhotos.length || infoIdx < 3) {
    // Add up to 2 photos
    for (let i = 0; i < 2 && photoIdx < displayPhotos.length; i++) {
      const ph = displayPhotos[photoIdx];
      sections.push(
        <div key={`photo-${photoIdx}`} className={photoIdx === 0 ? "pt-14" : "px-4"}>
          <img
            src={ph.url}
            alt=""
            className={photoIdx === 0 ? "aspect-[4/5] w-full object-cover" : "w-full rounded-2xl object-cover"}
          />
          {photoIdx === 0 && (
            <div className="px-4 pt-6">
              <h1 className="text-3xl font-bold">
                {p.name}
                {p.age != null ? `, ${p.age}` : ""}
              </h1>
              <p className="text-zinc-400">{p.city || ""}</p>
              {p.height ? <p className="text-sm text-zinc-500">{p.height} cm</p> : null}
            </div>
          )}
        </div>
      );
      photoIdx++;
    }

    // Add 1 info block
    if (infoIdx < 3) {
      const block = renderInfoBlock(infoIdx);
      if (block) sections.push(block);
      infoIdx++;
    }

    // Break if no more photos and all info blocks rendered
    if (photoIdx >= displayPhotos.length && infoIdx >= 3) break;
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      <ChevronToMap to="back" />
      <div className="space-y-6">
        {sections}

        <div className="flex gap-3 px-4 pb-8">
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
