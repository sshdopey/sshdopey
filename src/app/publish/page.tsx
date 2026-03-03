import { FadeIn } from "@/components/fade-in";
import { PublishForm } from "@/components/publish-form";

export const metadata = {
  title: "Publish — Dopey",
};

export default function PublishPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-14 sm:pt-20 pb-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
          Publish
        </h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <PublishForm />
      </FadeIn>
    </div>
  );
}
