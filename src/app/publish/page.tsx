import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PublishForm } from "@/components/publish-form";

export const metadata: Metadata = {
  title: "Publish",
  robots: { index: false, follow: false },
};

export default function PublishPage() {
  return (
    <main className="min-h-svh pt-28 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-mono text-[11px] tracking-[0.25em] uppercase text-zinc-600">
              Publish
            </h1>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <PublishForm />
        </FadeIn>
      </div>
    </main>
  );
}
