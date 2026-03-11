import { customAlphabet } from "nanoid";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

export const createId = customAlphabet(alphabet, 12);

export function readingTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}

export const DOPEY_SUBSCRIPTION_ID =
  process.env.NEXT_PUBLIC_DOPEY_SUBSCRIPTION_ID ?? "";

export function getDisplayName(id: string): string {
  if (DOPEY_SUBSCRIPTION_ID && id === DOPEY_SUBSCRIPTION_ID) {
    return "Dopey";
  }
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    style: "capital",
    seed: id,
  });
}

export function isDopey(subscriberId: string): boolean {
  return DOPEY_SUBSCRIPTION_ID !== "" && subscriberId === DOPEY_SUBSCRIPTION_ID;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}
