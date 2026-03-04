"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share, Sparkles, X, Link2, Check, Linkedin } from "lucide-react";
import {
  likePost,
  unlikePost,
  getPostLikeStatus,
  subscribeAction,
  postCommentAction,
  likeCommentAction,
  unlikeCommentAction,
  getCommentLikedIdsAction,
} from "@/lib/actions";
import { getDisplayName, isDopey } from "@/lib/utils";
import { fireSubscribeConfetti } from "@/lib/confetti";
import { useSidebar } from "./client-layout";
import { useLikedPosts } from "./liked-posts-provider";
import type { Comment, Subscriber } from "@/lib/db";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ── Share Menu ──

function ShareMenu({ postSlug, title }: { postSlug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/blog/${postSlug}`
    : "";

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1500);
  }

  function shareOnX() {
    const text = `Just read "${title}" by @sshdopey — absolutely worth your time 🔥`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
    setOpen(false);
  }

  function shareOnLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
    );
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line-faint text-muted hover:text-accent hover:border-accent/30 transition-all text-sm cursor-pointer"
      >
        <Share size={14} />
        Share
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-2 z-50 bg-surface border border-line rounded-xl overflow-hidden min-w-[190px] shadow-lg"
            >
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-secondary hover:text-accent hover:bg-surface-hover transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-accent" /> : <Link2 size={14} />}
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={shareOnX}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-secondary hover:text-accent hover:bg-surface-hover transition-colors border-t border-line-faint cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-secondary hover:text-accent hover:bg-surface-hover transition-colors border-t border-line-faint cursor-pointer"
              >
                <Linkedin size={14} />
                Share on LinkedIn
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Like + Ask AI + Share Bar ──

function LikeShareBar({
  postSlug,
  initialCount,
  title,
  subscriber,
}: {
  postSlug: string;
  initialCount: number;
  title: string;
  subscriber: Subscriber | null;
}) {
  const [count, setCount] = useState(initialCount);
  const [serverLiked, setServerLiked] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [, startTransition] = useTransition();
  const { toggle } = useSidebar();
  const { isLiked, addLiked, removeLiked } = useLikedPosts();

  const liked = serverLiked || isLiked(postSlug);

  useEffect(() => {
    if (!subscriber?.email || loaded) return;
    let cancelled = false;
    getPostLikeStatus(postSlug, subscriber.email).then((r) => {
      if (!cancelled) {
        setCount(r.count);
        setServerLiked(r.liked);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [postSlug, subscriber?.email, loaded]);

  useEffect(() => {
    if (!subscriber && loaded === false) {
      setLoaded(true);
    }
  }, [subscriber, loaded]);

  function handleLike() {
    if (liked && subscriber) {
      removeLiked(postSlug);
      setServerLiked(false);
      setCount((c) => Math.max(0, c - 1));
      startTransition(async () => {
        const r = await unlikePost(postSlug, subscriber.email);
        setCount(r.count);
      });
      return;
    }
    if (liked) return;
    addLiked(postSlug);
    setServerLiked(true);
    setCount((c) => c + 1);
    setParticles(Array.from({ length: 8 }, (_, i) => i));
    const email = subscriber?.email ?? null;
    startTransition(async () => {
      const r = await likePost(postSlug, email);
      if (r.error) {
        removeLiked(postSlug);
        setServerLiked(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        setCount(r.count);
      }
    });
    setTimeout(() => setParticles([]), 800);
  }

  return (
    <div className="flex items-center justify-between py-5 border-t border-line-faint mt-12">
      <motion.button
        onClick={handleLike}
        whileTap={{ scale: 0.92 }}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
          liked
            ? "border-accent/30 text-accent"
            : "border-line-faint text-muted hover:text-accent hover:border-accent/30"
        }`}
      >
        <span className="relative">
          <motion.div
            animate={liked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
          </motion.div>
          <AnimatePresence>
            {particles.map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i * Math.PI * 2) / 8) * 18,
                  y: Math.sin((i * Math.PI * 2) / 8) * 18,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <span className="w-1 h-1 rounded-full bg-accent" />
              </motion.span>
            ))}
          </AnimatePresence>
        </span>
        <span className="text-sm tabular-nums">{count}</span>
      </motion.button>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="ask-ai-glow flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line-faint text-muted hover:text-accent transition-colors text-sm cursor-pointer"
        >
          <Sparkles size={14} className="text-accent" />
          Ask AI
        </button>

        <ShareMenu postSlug={postSlug} title={title} />
      </div>
    </div>
  );
}

// ── Author + Inline Subscribe ──

function AuthorSubscribe({
  subscriber,
  onSubscribed,
}: {
  subscriber: Subscriber | null;
  onSubscribed: (sub: Subscriber) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await subscribeAction(email);
      if (result.subscriber) {
        localStorage.setItem("subscriber", JSON.stringify(result.subscriber));
        onSubscribed(result.subscriber);
        fireSubscribeConfetti();
      }
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="py-8 border-t border-line-faint">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Image
            src="/sshdopey.jpeg"
            alt="Dopey"
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-primary text-sm">
              Written by Dopey
            </p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
            Just one letter away from being Dope.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {subscriber ? (
            <p className="text-sm text-muted">
              Subscribed as{" "}
              <span className="text-accent font-medium">
                {getDisplayName(subscriber.id)}
              </span>{" "}
              ✓
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full sm:w-64 bg-surface border border-line-faint rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-ghost focus:outline-none focus:border-accent/40"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-accent text-inverse text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer whitespace-nowrap"
              >
                Subscribe
              </button>
              {error && (
                <p className="text-xs text-red-400 self-center">{error}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Comment Section ──

interface ThreadedComment extends Comment {
  children: ThreadedComment[];
}

function buildThreads(comments: Comment[]): ThreadedComment[] {
  const map = new Map<string, ThreadedComment>();
  const roots: ThreadedComment[] = [];
  for (const c of comments) map.set(c.id, { ...c, children: [] });
  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function CommentLikeBtn({
  commentId,
  initialCount,
  initialLiked,
  email,
  onLikedChange,
}: {
  commentId: string;
  initialCount: number;
  initialLiked: boolean;
  email: string | null;
  onLikedChange?: (commentId: string, liked: boolean) => void;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  function handleLike() {
    if (!email) return;
    if (liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      onLikedChange?.(commentId, false);
      startTransition(async () => {
        const r = await unlikeCommentAction(commentId, email);
        if (!r.error) setCount(r.count);
      });
      return;
    }
    setLiked(true);
    setCount((c) => c + 1);
    onLikedChange?.(commentId, true);
    startTransition(async () => {
      const r = await likeCommentAction(commentId, email);
      if (!r.error) setCount(r.count);
    });
  }

  return (
    <button
      onClick={handleLike}
      disabled={!email}
      className={`flex items-center gap-1 text-xs cursor-pointer transition-colors ${
        liked ? "text-accent" : "text-ghost hover:text-accent"
      } ${!email ? "opacity-30 cursor-default" : ""}`}
    >
      <Heart size={12} fill={liked ? "currentColor" : "none"} />
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </button>
  );
}

function ThreadNode({
  node,
  depth,
  postSlug,
  subscriber,
  onCommentAdded,
  onCommentLikedChange,
}: {
  node: ThreadedComment;
  depth: number;
  postSlug: string;
  subscriber: Subscriber | null;
  onCommentAdded: (comments: Comment[]) => void;
  onCommentLikedChange?: (commentId: string, liked: boolean) => void;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [, startTransition] = useTransition();

  function handleReply() {
    if (!subscriber || !replyText.trim()) return;
    const text = replyText;
    setReplyText("");
    setReplying(false);
    startTransition(async () => {
      const r = await postCommentAction(
        postSlug,
        subscriber.email,
        text.trim(),
        node.id,
      );
      if (r.comments) onCommentAdded(r.comments);
    });
  }

  const indent = Math.min(depth, 3);
  const displayName = getDisplayName(node.subscriber_id);
  const isOwner = isDopey(node.subscriber_id);

  return (
    <div style={{ marginLeft: indent > 0 ? `${indent * 20}px` : 0 }}>
      <div
        className={`py-3 ${depth > 0 ? "border-l border-line-faint pl-4" : ""}`}
      >
        <div className="flex items-center gap-2.5 mb-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              isOwner
                ? "/sshdopey.jpeg"
                : `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${node.subscriber_id}`
            }
            alt=""
            className="w-6 h-6 rounded-full shrink-0 object-cover"
          />
          <span className={`text-xs font-medium ${isOwner ? "text-accent" : "text-secondary"}`}>
            {displayName}
          </span>
          <span className="text-xs text-ghost">
            {timeAgo(node.created_at)}
          </span>
        </div>

        <p className="text-sm text-secondary leading-relaxed mb-2 pl-[34px]">
          {node.content}
        </p>

        <div className="flex items-center gap-3 pl-[34px]">
          <CommentLikeBtn
            commentId={node.id}
            initialCount={node.like_count}
            initialLiked={node.liked_by_me ?? false}
            email={subscriber?.email ?? null}
            onLikedChange={onCommentLikedChange}
          />
          {subscriber && (
            <button
              onClick={() => setReplying(!replying)}
              className="text-xs text-ghost hover:text-accent cursor-pointer transition-colors"
            >
              Reply
            </button>
          )}
        </div>

        <AnimatePresence>
          {replying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-[34px] mt-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                  className="flex-1 bg-surface border border-line-faint rounded-lg px-3 py-2 text-sm text-primary placeholder:text-ghost focus:outline-none focus:border-accent/40"
                  autoFocus
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="text-xs px-3 py-2 bg-accent text-inverse rounded-lg hover:opacity-90 disabled:opacity-30 cursor-pointer"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplying(false);
                    setReplyText("");
                  }}
                  className="text-xs text-ghost hover:text-accent cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {node.children.map((child) => (
        <ThreadNode
          key={child.id}
          node={child}
          depth={depth + 1}
          postSlug={postSlug}
          subscriber={subscriber}
          onCommentAdded={onCommentAdded}
          onCommentLikedChange={onCommentLikedChange}
        />
      ))}
    </div>
  );
}

function DiscussionSection({
  postSlug,
  comments: initialComments,
  subscriber,
  onCommentAdded,
}: {
  postSlug: string;
  comments: Comment[];
  subscriber: Subscriber | null;
  onCommentAdded: (comments: Comment[]) => void;
}) {
  const [text, setText] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!subscriber?.email) return;
    let cancelled = false;
    getCommentLikedIdsAction(postSlug, subscriber.email).then((r) => {
      if (!cancelled) setLikedCommentIds(new Set(r.commentIds));
    });
    return () => {
      cancelled = true;
    };
  }, [postSlug, subscriber?.email]);

  const commentsWithLiked = initialComments.map((c) => ({
    ...c,
    liked_by_me: c.liked_by_me ?? likedCommentIds.has(c.id),
  }));
  const threads = buildThreads(commentsWithLiked);

  function handlePost() {
    if (!subscriber || !text.trim()) return;
    const content = text;
    setText("");
    startTransition(async () => {
      const r = await postCommentAction(
        postSlug,
        subscriber.email,
        content.trim(),
        null,
      );
      if (r.comments) onCommentAdded(r.comments);
    });
  }

  const displayName = subscriber ? getDisplayName(subscriber.id) : "";

  return (
    <div className="py-8 border-t border-line-faint">
      <h2 className="text-sm font-semibold text-primary mb-6">
        Discussion
        {initialComments.length > 0 && (
          <span className="text-muted font-normal ml-2">
            {initialComments.length}
          </span>
        )}
      </h2>

      {threads.length > 0 && (
        <div className="mb-6 divide-y divide-line-faint">
          {threads.map((thread) => (
            <ThreadNode
              key={thread.id}
              node={thread}
              depth={0}
              postSlug={postSlug}
              subscriber={subscriber}
              onCommentAdded={onCommentAdded}
              onCommentLikedChange={(commentId, liked) => {
                setLikedCommentIds((prev) => {
                  const next = new Set(prev);
                  if (liked) next.add(commentId);
                  else next.delete(commentId);
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}

      {subscriber ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Comment as ${displayName}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            className="flex-1 bg-surface border border-line-faint rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-ghost focus:outline-none focus:border-accent/40"
          />
          <button
            onClick={handlePost}
            disabled={!text.trim()}
            className="px-4 py-2.5 bg-accent text-inverse text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-30 cursor-pointer"
          >
            Post
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted py-4 text-center border border-line-faint rounded-lg bg-surface/50">
          Subscribe above to join the conversation.
        </p>
      )}
    </div>
  );
}

// ── Main Export ──

export function PostInteractions({
  postSlug,
  postTitle,
  likeCount,
  initialComments,
}: {
  postSlug: string;
  postTitle: string;
  likeCount: number;
  initialComments: Comment[];
}) {
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("subscriber");
      if (stored) setSubscriber(JSON.parse(stored));
    } catch {}
  }, []);

  return (
    <>
      <LikeShareBar
        postSlug={postSlug}
        initialCount={likeCount}
        title={postTitle}
        subscriber={subscriber}
      />
      <AuthorSubscribe subscriber={subscriber} onSubscribed={setSubscriber} />
      <DiscussionSection
        postSlug={postSlug}
        comments={comments}
        subscriber={subscriber}
        onCommentAdded={setComments}
      />
    </>
  );
}
