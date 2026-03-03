"use server";

import { revalidatePath } from "next/cache";
import { createId } from "./utils";
import {
  addLike,
  addComment,
  addCommentLike,
  getComments,
  getCommentLikeCount,
  getSubscriberByEmail,
  createSubscriber,
} from "./db";
import type { Comment, Subscriber } from "./db";

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
    const id = createId();
    return { subscriber: createSubscriber(id, cleaned) };
  } catch {
    return { error: "Could not subscribe. Try again." };
  }
}

export async function postCommentAction(
  postSlug: string,
  email: string,
  content: string,
  parentId: string | null,
): Promise<{ comments?: Comment[]; error?: string }> {
  if (!content?.trim()) return { error: "Comment cannot be empty." };
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber) return { error: "Please subscribe first." };

  addComment(postSlug, subscriber.id, content.trim(), parentId);
  revalidatePath(`/blog/${postSlug}`);
  return { comments: getComments(postSlug) };
}

export async function likeCommentAction(
  commentId: string,
  email: string,
): Promise<{ count: number; error?: string }> {
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber) return { count: 0, error: "Subscribe first." };

  addCommentLike(commentId, subscriber.id);
  return { count: getCommentLikeCount(commentId) };
}
