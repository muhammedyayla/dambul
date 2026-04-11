import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export function FloatingTabBar() {
  const loc = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/notifications/unread-count");
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setUnread(data.count);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loc.pathname]);

  const tab = (path: string, label: string, badge?: number) => (
    <Link
      to={path}
      className={`relative flex flex-1 flex-col items-center justify-center rounded-full px-2 py-2 text-[11px] font-semibold transition-colors ${
        loc.pathname === path || loc.pathname.startsWith(path + "/")
          ? "bg-zinc-700 text-white"
          : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {label}
      {badge != null && badge > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-[1000] flex w-[min(92vw,420px)] -translate-x-1/2 rounded-full border border-zinc-700/80 bg-zinc-950/95 px-2 py-1 shadow-xl backdrop-blur">
      {tab("/swipe", "Swipe")}
      {tab("/chat", "Chat")}
      {tab("/scene", "Scene")}
      {tab("/notifications", "Bildirim", unread)}
    </div>
  );
}
