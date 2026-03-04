/**
 * CLI to create DB (if needed), run migrations, and seed. No circular deps with src/lib/seed.
 * Usage: pnpm db:seed (or npx tsx scripts/seed-cli.ts)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

for (const f of [".env", ".env.local"]) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const { getDb } = await import("../src/lib/db");
getDb();
console.log("Database ready and seeded (if empty).");
