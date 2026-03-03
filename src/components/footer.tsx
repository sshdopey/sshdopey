import Link from "next/link";
import { SocialLinks } from "./social-links";

export function Footer() {
  return (
    <footer className="border-t border-line-faint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-accent tracking-tight"
        >
          @sshdopey
        </Link>

        <SocialLinks variant="inline" />
      </div>
    </footer>
  );
}
