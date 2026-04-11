import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Realtime } from "ably";
import { ChevronToMap } from "../components/ChevronToMap";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { apiFetch, apiGet, apiPost } from "../api";
import { ScrollArea } from "../components/ui/scroll-area";

type Msg = { id: string; sender_id: string; body: string; created_at: string };

export function ChatThreadScreen() {
  const { threadId } = useParams<{ threadId: string }>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      const u = await apiGet<{ id: string }>("/api/auth/me");
      setMe(u.id);
    })();
  }, []);

  useEffect(() => {
    if (!threadId) return;
    void (async () => {
      try {
        const list = await apiGet<Msg[]>(`/api/chat/${threadId}/messages`);
        setMessages(list);
      } catch {
        /* ignore */
      }
    })();
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!threadId) return;

    const realtime = new Realtime({
      authCallback: (_tokenParams, callback) => {
        void apiFetch("/api/ably/token")
          .then((r) => {
            if (!r.ok) throw new Error("auth");
            return r.json();
          })
          .then((data: unknown) => {
            callback(null, data as never);
          })
          .catch((err: unknown) => callback(err as never, null));
      },
    });
    const channel = realtime.channels.get(`chat:${threadId}`);
    channel.subscribe("message", (msg) => {
      const data = msg.data as Msg;
      if (!data?.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    });

    return () => {
      channel.unsubscribe();
      realtime.close();
    };
  }, [threadId]);

  const send = async () => {
    if (!threadId || !text.trim()) return;
    const body = text.trim();
    setText("");
    try {
      const m = await apiPost<Msg>(`/api/chat/${threadId}/messages`, { body });
      setMessages((prev) =>
        prev.some((x) => x.id === m.id)
          ? prev
          : [...prev, m].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
      );
    } catch {
      setText(body);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <ChevronToMap />
      <div className="flex-1 pt-12">
        <ScrollArea className="h-[calc(100vh-8rem)] px-4">
          <div className="space-y-3 pb-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender_id === me ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    m.sender_id === me ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-100"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="flex gap-2 border-t border-zinc-800 p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void send())}
          placeholder="Mesaj yaz…"
          className="bg-zinc-900"
        />
        <Button onClick={() => void send()}>Gönder</Button>
      </div>
    </div>
  );
}
