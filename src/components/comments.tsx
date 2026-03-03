"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeAction, postCommentAction } from "@/lib/actions";
import type { Comment, Subscriber } from "@/lib/db";

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString + "Z").getTime();
  const s = Math.floor((now - then) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface CommentThread extends Comment {
  replies: CommentThread[];
}

function buildThreads(comments: Comment[]): CommentThread[] {
  const map = new Map<number, CommentThread>();
  const roots: CommentThread[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }
  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function CommentSection({
  slug,
  initialComments,
}: {
  slug: string;
  initialComments: Comment[];
}) {
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [subError, setSubError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dopey_subscriber");
      if (stored) setSubscriber(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  function handleSubscribe(formData: FormData) {
    setSubError(null);
    startTransition(async () => {
      const result = await subscribeAction(formData);
      if (result.error) {
        setSubError(result.error);
      } else if (result.subscriber) {
        setSubscriber(result.subscriber);
        localStorage.setItem(
          "dopey_subscriber",
          JSON.stringify(result.subscriber),
        );
      }
    });
  }

  function handleComment(content: string, parentId: number | null = null) {
    if (!subscriber) return;
    startTransition(async () => {
      const result = await postCommentAction(
        slug,
        subscriber.email,
        content,
        parentId,
      );
      if (result.comments) {
        setComments(result.comments);
        setReplyingTo(null);
      }
    });
  }

  const threads = buildThreads(comments);

  return (
    <div className="mt-20 pt-14 border-t border-zinc-900/60">
      <h3 className="text-base font-semibold text-zinc-200 mb-8">
        Discussion{" "}
        <span className="font-normal text-zinc-700">· {comments.length}</span>
      </h3>

      {/* Comments */}
      {threads.length > 0 && (
        <div className="mb-12">
          {threads.map((thread) => (
            <ThreadNode
              key={thread.id}
              comment={thread}
              depth={0}
              subscriber={subscriber}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onReply={handleComment}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {threads.length === 0 && (
        <p className="text-sm text-zinc-700 font-mono mb-10">
          No comments yet.
        </p>
      )}

      {/* Subscribe or comment */}
      {subscriber ? (
        <WriteForm
          label={`Commenting as ${subscriber.name}`}
          placeholder="Write a comment..."
          buttonText="Post"
          onSubmit={(content) => handleComment(content, null)}
          isPending={isPending}
        />
      ) : (
        <SubscribeForm
          onSubscribe={handleSubscribe}
          isPending={isPending}
          error={subError}
        />
      )}
    </div>
  );
}

function ThreadNode({
  comment,
  depth,
  subscriber,
  replyingTo,
  setReplyingTo,
  onReply,
  isPending,
}: {
  comment: CommentThread;
  depth: number;
  subscriber: Subscriber | null;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  onReply: (content: string, parentId: number | null) => void;
  isPending: boolean;
}) {
  return (
    <div
      className={
        depth > 0 ? "ml-6 sm:ml-8 border-l border-zinc-800/40 pl-5 sm:pl-6" : ""
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-4"
      >
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-sm font-medium text-zinc-300">
            {comment.subscriber_name}
          </span>
          <span className="text-xs font-mono text-zinc-700">
            {timeAgo(comment.created_at)}
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {comment.content}
        </p>
        {subscriber && depth < 3 && (
          <button
            onClick={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            className="text-xs text-zinc-700 hover:text-zinc-300 mt-2 font-mono transition-colors cursor-pointer"
          >
            {replyingTo === comment.id ? "Cancel" : "Reply"}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {replyingTo === comment.id && subscriber && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pb-4"
          >
            <WriteForm
              placeholder="Write a reply..."
              buttonText="Reply"
              onSubmit={(content) => onReply(content, comment.id)}
              onCancel={() => setReplyingTo(null)}
              isPending={isPending}
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>

      {comment.replies.map((reply) => (
        <ThreadNode
          key={reply.id}
          comment={reply}
          depth={Math.min(depth + 1, 3)}
          subscriber={subscriber}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          onReply={onReply}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

function SubscribeForm({
  onSubscribe,
  isPending,
  error,
}: {
  onSubscribe: (fd: FormData) => void;
  isPending: boolean;
  error: string | null;
}) {
  return (
    <div className="border border-zinc-800/50 rounded-xl p-6 sm:p-8">
      <p className="text-sm font-medium text-zinc-200 mb-1">
        Subscribe to join the conversation
      </p>
      <p className="text-xs text-zinc-600 mb-6">
        One-time. No spam. Just here to talk.
      </p>

      <form action={onSubscribe} className="space-y-3">
        <input
          name="name"
          placeholder="Name"
          required
          className="w-full bg-transparent border border-zinc-800/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full bg-transparent border border-zinc-800/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        {error && (
          <p className="text-xs text-zinc-500">{error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {isPending ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}

function WriteForm({
  label,
  placeholder,
  buttonText,
  onSubmit,
  onCancel,
  isPending,
  compact,
}: {
  label?: string;
  placeholder: string;
  buttonText: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isPending: boolean;
  compact?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      {label && (
        <p className="text-xs text-zinc-500 font-mono mb-3">{label}</p>
      )}
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const content = (fd.get("content") as string)?.trim();
          if (content) {
            onSubmit(content);
            formRef.current?.reset();
          }
        }}
      >
        <textarea
          name="content"
          placeholder={placeholder}
          required
          rows={compact ? 2 : 3}
          className="w-full bg-transparent border border-zinc-800/60 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 resize-none transition-colors"
        />
        <div className="flex items-center justify-end gap-3 mt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-zinc-600 hover:text-zinc-300 font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {isPending ? "..." : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}
