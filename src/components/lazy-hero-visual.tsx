"use client";

import dynamic from "next/dynamic";

const HeroVisual = dynamic(
  () => import("@/components/hero-visual").then((m) => m.HeroVisual),
  { ssr: false },
);

export function LazyHeroVisual() {
  return <HeroVisual />;
}
