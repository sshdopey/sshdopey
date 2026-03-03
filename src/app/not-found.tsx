import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-svh px-6 text-center">
      <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-zinc-300 mb-4">
        404
      </h1>
      <p className="text-base text-zinc-600 mb-10">
        Nothing here. Wrong tunnel.
      </p>
      <Link
        href="/"
        className="font-mono text-sm text-zinc-500 hover:text-white transition-colors duration-200"
      >
        ← home
      </Link>
    </main>
  );
}
