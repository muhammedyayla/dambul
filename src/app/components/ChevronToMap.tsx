import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";

type Props = { to?: "map" | "back"; className?: string };

export function ChevronToMap({ to = "map", className = "" }: Props) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (to === "back" ? navigate(-1) : navigate("/map"))}
      className={`absolute top-4 right-4 z-50 flex size-10 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-100 shadow-lg ring-1 ring-zinc-700/80 ${className}`}
      aria-label={to === "back" ? "Geri" : "Haritaya dön"}
    >
      <ChevronDown className="size-6" />
    </button>
  );
}
