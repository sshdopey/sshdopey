"use client";

import { useState, useEffect } from "react";
import { getLikeCountsAction } from "@/lib/actions";

/**
 * Returns like counts for preview cards. Uses initial (SSG) counts immediately,
 * then fetches real counts on mount so cards update to real-time data as fast as possible.
 */
export function useLikeCounts(
  initialCounts: Record<string, number>,
): Record<string, number> {
  const [counts, setCounts] = useState(initialCounts);

  useEffect(() => {
    let cancelled = false;
    getLikeCountsAction().then((r) => {
      if (!cancelled) setCounts(r.likeCounts);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}
