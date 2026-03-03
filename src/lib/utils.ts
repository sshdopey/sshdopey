import { customAlphabet } from "nanoid";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

export const createId = customAlphabet(alphabet, 12);

export function getDisplayName(id: string): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    style: "capital",
    seed: id,
  });
}
