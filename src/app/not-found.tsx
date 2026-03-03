import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-7xl sm:text-8xl font-bold tracking-tighter text-primary">
        404
      </h1>
      <p className="text-muted mt-4 text-sm">
        Nothing here. Wrong tunnel.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm text-dim hover:text-primary transition-colors"
      >
        ← home
      </Link>
    </div>
  );
}
