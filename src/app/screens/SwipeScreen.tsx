import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { Heart, Star, X } from "lucide-react";
import { ChevronToMap } from "../components/ChevronToMap";
import { Button } from "../components/ui/button";
import { apiGet, apiPost } from "../api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type SwipeUser = {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  age: number | null;
};

export function SwipeScreen() {
  const [gender, setGender] = useState("all");
  const [stack, setStack] = useState<SwipeUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const g =
        gender === "all"
          ? "all"
          : gender === "female"
            ? "female"
            : gender === "male"
              ? "male"
              : "other";
      const q = g === "all" ? "" : `?gender=${encodeURIComponent(g)}`;
      const list = await apiGet<SwipeUser[]>(`/api/users/swipe${q}`);
      setStack(list);
    } catch {
      toast.error("Liste yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [gender]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = stack[0];

  const swipeAway = async (dir: "left" | "right", type: "pass" | "like" | "super") => {
    if (!current) return;
    const uid = current.id;
    if (dir === "left" && type === "pass") {
      setStack((s) => s.filter((u) => u.id !== uid));
      return;
    }
    try {
      const res = await apiPost<{ matched?: boolean; thread_id?: string | null }>("/api/likes", {
        to_user: uid,
        type: type === "super" ? "super" : "like",
      });
      if ((res as { matched?: boolean }).matched && res.thread_id)
        toast.success("Eşleşme! Sohbet açıldı.");
      setStack((s) => s.filter((u) => u.id !== uid));
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <ChevronToMap />
      <div className="flex items-center justify-between px-4 pt-14">
        <p className="text-lg font-bold">Keşfet</p>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-40 bg-zinc-900">
            <SelectValue placeholder="Filtre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Herkes</SelectItem>
            <SelectItem value="female">Kadın</SelectItem>
            <SelectItem value="male">Erkek</SelectItem>
            <SelectItem value="other">Diğer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-28">
        {loading ? (
          <p className="text-zinc-500">Yükleniyor…</p>
        ) : !current ? (
          <p className="text-zinc-500">Şimdilik kimse yok</p>
        ) : (
          <SwipeCard
            key={current.id}
            user={current}
            onSwipeComplete={(dir, kind) => {
              void swipeAway(dir, kind);
            }}
          />
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 px-6">
        <Button
          type="button"
          variant="outline"
          className="size-14 rounded-full border-rose-500/50 text-rose-400"
          onClick={() => void swipeAway("left", "pass")}
        >
          <X className="size-7" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="size-14 rounded-full border-amber-400/50 text-amber-300"
          onClick={() => void swipeAway("right", "super")}
        >
          <Star className="size-7" />
        </Button>
        <Button
          type="button"
          className="size-14 rounded-full bg-violet-600 hover:bg-violet-500"
          onClick={() => void swipeAway("right", "like")}
        >
          <Heart className="size-7" />
        </Button>
      </div>
    </div>
  );
}

function SwipeCard({
  user,
  onSwipeComplete,
}: {
  user: SwipeUser;
  onSwipeComplete: (dir: "left" | "right", kind: "pass" | "like" | "super") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0, 1, 1, 1, 0]);

  const photo = user.avatar_url || "https://placehold.co/400x600/27272a/a1a1aa/png?text=?";

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        const dx = info.offset.x;
        if (dx > 100) {
          void animate(x, 400, { duration: 0.2 }).then(() => onSwipeComplete("right", "like"));
        } else if (dx < -100) {
          void animate(x, -400, { duration: 0.2 }).then(() => onSwipeComplete("left", "pass"));
        } else {
          void animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
        }
      }}
      className="relative w-full max-w-md cursor-grab overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl active:cursor-grabbing"
    >
      <div className="aspect-[3/4] w-full">
        <img src={photo} alt="" className="size-full object-cover" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-24">
        <p className="text-2xl font-bold text-white">
          {user.name}
          {user.age != null ? `, ${user.age}` : ""}
        </p>
        <p className="text-sm text-zinc-300">{user.city || ""}</p>
      </div>
    </motion.div>
  );
}
