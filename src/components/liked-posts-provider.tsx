"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { Heart } from "lucide-react";
import { getLikedPostSlugsAction } from "@/lib/actions";

const LIKED_POSTS_KEY = "liked_posts";

function loadLikedFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LIKED_POSTS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveLikedToStorage(slugs: Set<string>) {
  try {
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify([...slugs]));
  } catch {}
}

type LikedPostsContextType = {
  likedSlugs: Set<string>;
  addLiked: (slug: string) => void;
  removeLiked: (slug: string) => void;
  isLiked: (slug: string) => boolean;
  isReady: boolean;
};

const LikedPostsContext = createContext<LikedPostsContextType>({
  likedSlugs: new Set(),
  addLiked: () => {},
  removeLiked: () => {},
  isLiked: () => false,
  isReady: false,
});

export function useLikedPosts() {
  return useContext(LikedPostsContext);
}

export function LikedPostsProvider({ children }: { children: ReactNode }) {
  const [likedSlugs, setLikedSlugs] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fromStorage = loadLikedFromStorage();
    queueMicrotask(() => setLikedSlugs(fromStorage));

    let subscriberEmail: string | null = null;
    try {
      const raw = localStorage.getItem("subscriber");
      if (raw) {
        const sub = JSON.parse(raw) as { email?: string };
        subscriberEmail = sub?.email ?? null;
      }
    } catch {}

    if (subscriberEmail) {
      getLikedPostSlugsAction(subscriberEmail).then(({ slugs }) => {
        setLikedSlugs((prev) => {
          const next = new Set(prev);
          for (const s of slugs) next.add(s);
          saveLikedToStorage(next);
          return next;
        });
        setIsReady(true);
      });
    } else {
      const t = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(t);
    }
  }, []);

  const addLiked = useCallback((slug: string) => {
    setLikedSlugs((prev) => {
      const next = new Set(prev);
      next.add(slug);
      saveLikedToStorage(next);
      return next;
    });
  }, []);

  const removeLiked = useCallback((slug: string) => {
    setLikedSlugs((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      saveLikedToStorage(next);
      return next;
    });
  }, []);

  const isLiked = useCallback(
    (slug: string) => likedSlugs.has(slug),
    [likedSlugs]
  );

  return (
    <LikedPostsContext.Provider
      value={{
        likedSlugs,
        addLiked,
        removeLiked,
        isLiked,
        isReady,
      }}
    >
      {children}
    </LikedPostsContext.Provider>
  );
}

export function PostLikeBadge({
  slug,
  count,
  size = 11,
  className = "",
}: {
  slug: string;
  count: number;
  size?: number;
  className?: string;
}) {
  const { isLiked } = useLikedPosts();
  const liked = isLiked(slug);
  const show = count > 0 || liked;

  if (!show) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 ${liked ? "text-accent" : "text-muted"} ${className}`}
      aria-label={liked ? "You liked this post" : `${count} likes`}
    >
      <Heart size={size} fill={liked ? "currentColor" : "none"} />
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </span>
  );
}
