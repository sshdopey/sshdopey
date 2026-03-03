"use server";

import { revalidatePath } from "next/cache";
import {
  addLike,
  addComment,
  createPost,
  getComments,
  getSubscriberByEmail,
  createSubscriber,
} from "./db";
import type { Comment, Subscriber } from "./db";

export async function likePost(postSlug: string): Promise<{ count: number }> {
  const count = addLike(postSlug);
  return { count };
}

export async function subscribeAction(
  formData: FormData,
): Promise<{ subscriber?: Subscriber; error?: string }> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name?.trim() || !email?.trim()) {
    return { error: "Name and email are required." };
  }

  const existing = getSubscriberByEmail(email.trim().toLowerCase());
  if (existing) {
    return { subscriber: existing };
  }

  try {
    const subscriber = createSubscriber(name.trim(), email.trim().toLowerCase());
    return { subscriber };
  } catch {
    return { error: "Could not subscribe. Try a different email." };
  }
}

export async function postCommentAction(
  postSlug: string,
  email: string,
  content: string,
  parentId: number | null,
): Promise<{ comments?: Comment[]; error?: string }> {
  if (!content?.trim()) {
    return { error: "Comment cannot be empty." };
  }

  const subscriber = getSubscriberByEmail(email);
  if (!subscriber) {
    return { error: "Please subscribe first." };
  }

  addComment(postSlug, subscriber.id, content.trim(), parentId);
  revalidatePath(`/blog/${postSlug}`);
  const comments = getComments(postSlug);
  return { comments };
}

export async function publishPost(
  formData: FormData,
): Promise<{ success?: boolean; slug?: string; error?: string }> {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const featured = formData.get("featured") === "on";

  if (!title?.trim() || !content?.trim()) {
    return { error: "Title and content are required." };
  }

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
    createPost(title.trim(), slug, content.trim(), excerpt, featured);
    revalidatePath("/blog");
    revalidatePath("/");
    return { success: true, slug };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to publish.";
    return { error: message };
  }
}
