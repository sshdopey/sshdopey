"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { publishPost } from "@/lib/actions";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] border border-zinc-800/60 rounded-xl animate-pulse bg-zinc-950" />
  ),
});

export function PublishForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const router = useRouter();

  function handleDeploy() {
    if (!title.trim() || !content.trim()) {
      setStatus({ type: "error", message: "Title and content required." });
      return;
    }

    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);
    if (featured) formData.set("featured", "on");

    startTransition(async () => {
      const result = await publishPost(formData);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "Deployed." });
        setTimeout(() => router.push(`/blog/${result.slug}`), 600);
      }
    });
  }

  return (
    <div className="space-y-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100 placeholder-zinc-800 focus:outline-none caret-zinc-400"
      />

      <div
        className="border border-zinc-800/60 rounded-xl overflow-hidden"
        data-color-mode="dark"
      >
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={500}
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-transparent accent-white"
            />
            <span className="text-sm text-zinc-500">Featured</span>
          </label>

          {status && (
            <span
              className={`text-sm font-mono ${
                status.type === "error" ? "text-zinc-500" : "text-zinc-300"
              }`}
            >
              {status.message}
            </span>
          )}
        </div>

        <button
          onClick={handleDeploy}
          disabled={isPending}
          className="px-6 py-2.5 bg-white text-zinc-900 text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {isPending ? "Deploying..." : "Deploy →"}
        </button>
      </div>
    </div>
  );
}
