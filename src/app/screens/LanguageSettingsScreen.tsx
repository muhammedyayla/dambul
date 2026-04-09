import { useNavigate } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";

const LANGUAGES = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
];

export function LanguageSettingsScreen() {
  const navigate = useNavigate();
  const selected = localStorage.getItem("dambul_lang") ?? "tr";

  const select = (code: string) => {
    localStorage.setItem("dambul_lang", code);
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold">Dil seçimi</h1>
      </header>

      <ul className="divide-y divide-border px-4">
        {LANGUAGES.map((lang) => (
          <li key={lang.code}>
            <button
              type="button"
              onClick={() => select(lang.code)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="text-base">{lang.label}</span>
              <Check
                className={cn(
                  "size-5 text-accent",
                  selected !== lang.code && "invisible",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
