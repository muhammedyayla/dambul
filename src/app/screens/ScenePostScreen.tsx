import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronToMap } from "../components/ChevronToMap";
import { apiGet, apiPost } from "../api";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

type PostDetail = {
  id: string;
  user_id: string;
  title: string;
  location_tag: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_city: string | null;
  author_tags: unknown;
};

export function ScenePostScreen() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);

  useEffect(() => {
    if (!postId) return;
    void (async () => {
      try {
        const p = await apiGet<PostDetail>(`/api/scene/posts/${postId}`);
        setPost(p);
      } catch {
        toast.error("Gönderi bulunamadı");
      }
    })();
  }, [postId]);

  const sendMsg = async () => {
    if (!post) return;
    try {
      const r = await apiPost<{ thread_id: string }>("/api/chat/threads", {
        other_user_id: post.user_id,
      });
      navigate(`/chat/${r.thread_id}`);
    } catch {
      toast.error("Sohbet açılamadı");
    }
  };

  if (!post) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        Yükleniyor…
      </div>
    );
  }

  const tags = Array.isArray(post.author_tags) ? (post.author_tags as string[]) : [];

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-24 pt-14 text-zinc-100">
      <ChevronToMap />
      <h1 className="mt-2 text-2xl font-bold">{post.title}</h1>
      {post.location_tag ? <p className="text-sm text-zinc-500">{post.location_tag}</p> : null}

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-14">
            <AvatarImage src={post.author_avatar ?? undefined} />
            <AvatarFallback>{post.author_name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">{post.author_name}</p>
            <p className="text-sm text-zinc-400">{post.author_city || ""}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
      </div>

      <Button className="mt-8 w-full" onClick={() => void sendMsg()}>
        Mesaj Gönder
      </Button>
    </div>
  );
}
