import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { ChevronToMap } from "../components/ChevronToMap";
import { apiGet, apiPost } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { formatRelativeTr } from "../lib/time";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

type Post = {
  id: string;
  title: string;
  location_tag: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
};

export function VibeFeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loc, setLoc] = useState("");

  const load = async () => {
    const list = await apiGet<Post[]>("/api/vibe/posts");
    setPosts(list);
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    if (!title.trim()) return;
    await apiPost("/api/vibe/posts", { title: title.trim(), location_tag: loc.trim() || null });
    setTitle("");
    setLoc("");
    setOpen(false);
    void load();
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      <ChevronToMap />
      <div className="px-4 pt-14">
        <h1 className="text-2xl font-bold">Vibe</h1>
      </div>
      <ul className="mt-4 space-y-2 px-2">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              to={`/vibe/${p.id}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:bg-zinc-900"
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={p.author_avatar ?? undefined} />
                  <AvatarFallback>{p.author_name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.author_name}</p>
                  <p className="text-lg font-bold text-white">{p.title}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                    {p.location_tag ? <span className="rounded bg-zinc-800 px-2 py-0.5">{p.location_tag}</span> : null}
                    <span>{formatRelativeTr(p.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg"
          >
            <Plus className="size-7" />
          </button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Yeni gönderi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Başlık</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-zinc-900" />
            </div>
            <div>
              <Label>Konum etiketi</Label>
              <Input value={loc} onChange={(e) => setLoc(e.target.value)} className="bg-zinc-900" />
            </div>
            <Button onClick={() => void create()}>Paylaş</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
