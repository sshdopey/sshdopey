"use server";

import { revalidatePath } from "next/cache";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";
import {
  addLike,
  addComment,
  addCommentLike,
  createPost,
  getComments,
  getCommentLikeCount,
  getSubscriberByEmail,
  createSubscriber,
} from "./db";
import type { Comment, Subscriber } from "./db";

function generateName(): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    style: "capital",
    length: 2,
  });
}

export async function likePost(postSlug: string): Promise<{ count: number }> {
  return { count: addLike(postSlug) };
}

export async function subscribeAction(
  email: string,
): Promise<{ subscriber?: Subscriber; error?: string }> {
  if (!email?.trim()) return { error: "Email is required." };

  const cleaned = email.trim().toLowerCase();
  const existing = getSubscriberByEmail(cleaned);
  if (existing) return { subscriber: existing };

  try {
    const name = generateName();
    return { subscriber: createSubscriber(name, cleaned) };
  } catch {
    return { error: "Could not subscribe. Try again." };
  }
}

export async function postCommentAction(
  postSlug: string,
  email: string,
  content: string,
  parentId: number | null,
): Promise<{ comments?: Comment[]; error?: string }> {
  if (!content?.trim()) return { error: "Comment cannot be empty." };
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber) return { error: "Please subscribe first." };

  addComment(postSlug, subscriber.id, content.trim(), parentId);
  revalidatePath(`/blog/${postSlug}`);
  return { comments: getComments(postSlug) };
}

export async function likeCommentAction(
  commentId: number,
  email: string,
): Promise<{ count: number; error?: string }> {
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber) return { count: 0, error: "Subscribe first." };

  addCommentLike(commentId, subscriber.id);
  return { count: getCommentLikeCount(commentId) };
}

export async function publishPost(
  formData: FormData,
): Promise<{ success?: boolean; slug?: string; error?: string }> {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const featured = formData.get("featured") === "on";
  const tags = (formData.get("tags") as string) || "";
  const coverImage = (formData.get("cover_image") as string) || "";

  if (!title?.trim() || !content?.trim())
    return { error: "Title and content are required." };

  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const excerpt = content
    .trim()
    .slice(0, 160)
    .replace(/[#*_`>\[\]]/g, "")
    .trim();

  try {
    createPost(
      title.trim(),
      slug,
      content.trim(),
      excerpt,
      featured,
      tags.trim(),
      coverImage.trim(),
    );
    revalidatePath("/blog");
    revalidatePath("/");
    return { success: true, slug };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to publish." };
  }
}
