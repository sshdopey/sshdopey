"use server";

import { revalidatePath } from "next/cache";
import { createId } from "./utils";
import {
  addLike,
  removePostLike,
  hasUserLikedPost,
  getLikeCount,
  getLikeCounts,
  getLikedPostSlugsForSubscriber,
  addComment,
  addCommentLike,
  removeCommentLike,
  getComments,
  getCommentLikeCount,
  getCommentLikedIdsForPost,
  getSubscriberByEmail,
  createSubscriber,
} from "./db";
import type { Comment, Subscriber } from "./db";

export async function getPostLikeStatus(
  postSlug: string,
  email: string | null,
): Promise<{ count: number; liked: boolean }> {
  const count = getLikeCount(postSlug);
  if (!email) return { count, liked: false };
  const subscriber = getSubscriberByEmail(email);
  const liked = subscriber ? hasUserLikedPost(postSlug, subscriber.id) : false;
  return { count, liked };
}

export async function getLikedPostSlugsAction(
  email: string | null,
): Promise<{ slugs: string[] }> {
  if (!email) return { slugs: [] };
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber) return { slugs: [] };
  const slugs = getLikedPostSlugsForSubscriber(subscriber.id);
  return { slugs };
}

export async function likePost(
  postSlug: string,
  email: string | null,
): Promise<{ count: number; liked: boolean; error?: string }> {
  if (email) {
    const subscriber = getSubscriberByEmail(email);
    if (!subscriber)
      return {
        count: getLikeCount(postSlug),
        liked: false,
        error: "Subscribe first.",
      };
    const count = addLike(postSlug, subscriber.id);
    revalidatePath(`/blog/${postSlug}`);
    revalidatePath("/blog");
    revalidatePath("/");
    return { count, liked: true };
  }
  const count = addLike(postSlug, null);
  revalidatePath(`/blog/${postSlug}`);
  revalidatePath("/blog");
  revalidatePath("/");
  return { count, liked: true };
}

export async function unlikePost(
  postSlug: string,
  email: string,
): Promise<{ count: number; error?: string }> {
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber)
    return { count: getLikeCount(postSlug), error: "Subscribe first." };
  const count = removePostLike(postSlug, subscriber.id);
  revalidatePath(`/blog/${postSlug}`);
  revalidatePath("/blog");
  revalidatePath("/");
  return { count };
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
  return { comments: getComments(postSlug, subscriber.id) };
}

export async function likeCommentAction(
  commentId: string,
  email: string,
  postSlug: string,
): Promise<{ count: number; error?: string }> {
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber) return { count: 0, error: "Subscribe first." };

  addCommentLike(commentId, subscriber.id);
  revalidatePath(`/blog/${postSlug}`);
  return { count: getCommentLikeCount(commentId) };
}

export async function unlikeCommentAction(
  commentId: string,
  email: string,
  postSlug: string,
): Promise<{ count: number; error?: string }> {
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber)
    return { count: getCommentLikeCount(commentId), error: "Subscribe first." };

  removeCommentLike(commentId, subscriber.id);
  revalidatePath(`/blog/${postSlug}`);
  return { count: getCommentLikeCount(commentId) };
}

export async function getCommentLikedIdsAction(
  postSlug: string,
  email: string,
): Promise<{ commentIds: string[] }> {
  const subscriber = getSubscriberByEmail(email);
  if (!subscriber) return { commentIds: [] };
  const commentIds = getCommentLikedIdsForPost(postSlug, subscriber.id);
  return { commentIds };
}

/** Fetch comments for a post (for dynamic load on client). Optional email for liked_by_me. */
export async function getCommentsForPostAction(
  postSlug: string,
  email: string | null,
): Promise<{ comments: Comment[] }> {
  const subscriber = email ? getSubscriberByEmail(email) : undefined;
  const comments = getComments(postSlug, subscriber?.id);
  return { comments };
}

/** Fetch all like counts for preview cards (blog list, carousel, keep reading) so they show real-time data. */
export async function getLikeCountsAction(): Promise<{
  likeCounts: Record<string, number>;
}> {
  const likeCounts = getLikeCounts();
  return { likeCounts };
}

/** Single fetch for post stats (like count, liked, comments) so client gets both in one round-trip. */
export async function getPostStatsAction(
  postSlug: string,
  email: string | null,
): Promise<{ likeCount: number; liked: boolean; comments: Comment[] }> {
  const count = getLikeCount(postSlug);
  let liked = false;
  if (email) {
    const subscriber = getSubscriberByEmail(email);
    liked = subscriber ? hasUserLikedPost(postSlug, subscriber.id) : false;
  }
  const subscriber = email ? getSubscriberByEmail(email) : undefined;
  const comments = getComments(postSlug, subscriber?.id);
  return { likeCount: count, liked, comments };
}
