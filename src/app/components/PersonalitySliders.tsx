import { cn } from "./ui/utils";

/** 0–19 çubuk indeksi → DB’de 0–100 */
export function barsToDb(b: number): number {
  return Math.round((b / 19) * 100);
}

/** DB'deki 0–100 → 0–19 çubuk indeksi */
export function dbToBars(v: number): number {
  return Math.round((v / 100) * 19);
}

type PersonalityKey = 
  | "personality_humor" 
  | "personality_energy" 
  | "personality_lifestyle" 
  | "personality_first_step" 
  | "personality_love_language" 
  | "personality_weekend";

type PersonalitySlidersProps = {
  values: {
    personality_humor: number;
    personality_energy: number;
    personality_lifestyle: number;
    personality_first_step: number;
    personality_love_language: number;
    personality_weekend: number;
  };
  onChange: (key: PersonalityKey, dbValue: number) => void;
};

export function PersonalitySliders({ values, onChange }: PersonalitySlidersProps) {
  const traits = [
    { key: "personality_humor", label: "Mizahın", left: "Alaycı", right: "Pozitif" },
    { key: "personality_energy", label: "Enerji", left: "İçe dönük", right: "Dışa dönük" },
    { key: "personality_lifestyle", label: "Yaşam tarzın", left: "Güvenli", right: "Maceracı" },
    { key: "personality_first_step", label: "İlk adım", left: "Ben atarım", right: "Beklerim" },
    { key: "personality_love_language", label: "Aşk dilin", left: "Kelime", right: "Dokunma" },
    { key: "personality_weekend", label: "Hafta sonu", left: "Evde chill", right: "Macera" },
  ] as const;

  return (
    <div className="space-y-6">
      {traits.map((t) => (
        <BarScale20
          key={t.key}
          label={t.label}
          left={t.left}
          right={t.right}
          value={dbToBars(values[t.key])}
          onChange={(v) => onChange(t.key, barsToDb(v))}
        />
      ))}
    </div>
  );
}

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
    </div>
  );
}
