import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronToMap } from "../components/ChevronToMap";
import { apiGet } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { formatRelativeTr } from "../lib/time";

type ThreadRow = {
  thread_id: string;
  other: { id: string; name: string; avatar_url: string | null; city: string | null };
  last_message: string | null;
  last_at: string | null;
};

export function ChatListScreen() {
  const [rows, setRows] = useState<ThreadRow[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const list = await apiGet<ThreadRow[]>("/api/chat/threads");
        setRows(list);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ChevronToMap />
      <div className="px-4 pt-14">
        <h1 className="text-2xl font-bold">Sohbetler</h1>
      </div>
      <ul className="mt-4 divide-y divide-zinc-800">
        {rows.map((r) => (
          <li key={r.thread_id}>
            <Link
              to={`/chat/${r.thread_id}`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-zinc-900/80"
            >
              <Avatar className="size-12">
                <AvatarImage src={r.other.avatar_url ?? undefined} />
                <AvatarFallback>{r.other.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.other.name}</p>
                <p className="truncate text-sm text-zinc-500">{r.last_message || "Henüz mesaj yok"}</p>
              </div>
              {r.last_at ? (
                <span className="shrink-0 text-xs text-zinc-500">{formatRelativeTr(r.last_at)}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="px-4 pt-8 text-center text-zinc-500">Sohbet yok</p> : null}
    </div>
  );
}
