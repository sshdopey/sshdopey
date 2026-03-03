import Link from "next/link";
import { SocialLinks } from "./social-links";

export function Footer() {
  return (
    <footer className="border-t border-line-faint">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-primary tracking-tight"
        >
          @sshdopey
        </Link>

        <SocialLinks variant="inline" />
      </div>
    </footer>
  );
}
