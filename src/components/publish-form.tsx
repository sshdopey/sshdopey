"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { publishPost } from "@/lib/actions";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function PublishForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [, startTransition] = useTransition();

  function handlePublish() {
    setStatus(null);
    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);
    formData.set("tags", tags);
    formData.set("cover_image", coverImage);
    if (featured) formData.set("featured", "on");

    startTransition(async () => {
      const result = await publishPost(formData);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: `Published → /blog/${result.slug}` });
        setTitle("");
        setContent("");
        setTags("");
        setCoverImage("");
        setFeatured(false);
      }
    });
  }

  return (
    <div className="space-y-5">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-transparent border-b border-line-faint text-primary text-2xl sm:text-3xl font-bold placeholder:text-ghost focus:outline-none focus:border-line pb-3 transition-colors"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted uppercase tracking-widest block mb-2">
            Tags
          </label>
          <input
            type="text"
            placeholder="rust, ai, engineering"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-surface border border-line-faint rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-ghost focus:outline-none focus:border-line"
          />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-widest block mb-2">
            Cover Image URL
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full bg-surface border border-line-faint rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-ghost focus:outline-none focus:border-line"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="featured" className="text-sm text-secondary">
          Featured post{" "}
          <span className="text-ghost">(max 3 at a time)</span>
        </label>
      </div>

      <div data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={(v) => setContent(v || "")}
          height={440}
          preview="edit"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePublish}
          disabled={!title.trim() || !content.trim()}
          className="px-6 py-2.5 bg-accent text-inverse text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-30 transition-opacity cursor-pointer"
        >
          Deploy
        </button>

        {status && (
          <span
            className={`text-sm ${status.type === "error" ? "text-red-400" : "text-muted"}`}
          >
            {status.message}
          </span>
        )}
      </div>
    </div>
  );
}
