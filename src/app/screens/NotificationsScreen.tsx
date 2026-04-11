import { useEffect, useState } from "react";
import { ChevronToMap } from "../components/ChevronToMap";
import { apiFetch, apiGet, apiPatch } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { formatRelativeTr } from "../lib/time";

type Row = {
  id: string;
  action: string;
  created_at: string;
  actor_name: string | null;
  actor_avatar: string | null;
};

export function NotificationsScreen() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const list = await apiGet<Row[]>("/api/notifications");
        setRows(list);
        await apiPatch("/api/notifications/read", {});
        void apiFetch("/api/notifications/unread-count");
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      <ChevronToMap />
      <div className="px-4 pt-14">
        <h1 className="text-2xl font-bold">Bildirimler</h1>
      </div>
      <ul className="mt-4 divide-y divide-zinc-800">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="size-11">
              <AvatarImage src={r.actor_avatar ?? undefined} />
              <AvatarFallback>{(r.actor_name || "?").slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{r.actor_name || "Biri"}</span>{" "}
                <span className="text-zinc-400">{r.action}</span>
              </p>
              <p className="text-xs text-zinc-500">{formatRelativeTr(r.created_at)}</p>
            </div>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="px-4 pt-8 text-center text-zinc-500">Bildirim yok</p> : null}
    </div>
  );
}
