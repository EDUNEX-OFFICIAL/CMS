import { parseEnv, type ParsedEnv } from "@repo/shared";

let cached: ParsedEnv | null = null;

export function getEnv(): ParsedEnv {
  if (!cached) {
    cached = parseEnv();
  }
  return cached;
}
