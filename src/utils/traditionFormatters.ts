/**
 * Archival formatting utilities for Gharana traditions, Lay tempos, and Artist names.
 */

/**
 * Normalizes a tradition string for database storage:
 * - Strips any occurrences of "Gharana" (e.g., "Kirana Gharana" -> "Kirana")
 * - Converts slashes into commas (e.g., "Gwalior / Agra" -> "Gwalior, Agra")
 * - Strictly preserves "N/A" as "N/A" (never "N, A")
 * - Returns clean comma-separated list or null
 */
export function normalizeTradition(val: string | null | undefined): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (trimmed === "N/A" || trimmed === "None") return "N/A";

  // First replace slashes with commas, unless part of N/A
  const withCommas = trimmed.replace(/\//g, ",");

  // Split by commas, clean each part
  const parts = withCommas
    .split(",")
    .map((p) => {
      // Strip word "gharana" case-insensitively with boundary
      const clean = p.replace(/\bgharana\b/gi, "").trim();
      return clean.replace(/\s+/g, " ");
    })
    .filter(Boolean);

  if (parts.length === 0) return null;

  // Deduplicate while maintaining order
  const seen = new Set<string>();
  const uniqueParts: string[] = [];

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueParts.push(part);
    }
  }

  // If the single remaining item is N/A
  if (uniqueParts.length === 1 && uniqueParts[0].toLowerCase() === "n/a") {
    return "N/A";
  }

  return uniqueParts.join(", ");
}

/**
 * Formats a tradition string into individual display bubbles:
 * - Splits comma lists into individual tokens
 * - Appends " Gharana" to each token (e.g. "Agra" -> "Agra Gharana")
 * - Preserves "N/A" and "Independent" without appending " Gharana"
 * - Avoids double appending (e.g., "Agra Gharana" -> "Agra Gharana")
 */
export function formatGharanaDisplay(tradition: string | null | undefined): string[] {
  if (!tradition) return ["N/A"];
  const trimmed = tradition.trim();
  if (!trimmed || trimmed === "N/A" || trimmed === "None") return ["N/A"];

  const items = trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length === 0) return ["N/A"];

  return items.map((item) => {
    if (item === "N/A") return "N/A";
    if (item.toLowerCase() === "independent") return "Independent";

    // Clean off any existing "Gharana" suffix first to avoid duplicate
    const base = item.replace(/\s*gharana\b/gi, "").trim();
    if (!base) return item;
    return `${base} Gharana`;
  });
}

/**
 * Normalizes a single lay/tempo item:
 * - Preserves "Madhyalay" exactly (does NOT truncate to "Madhya")
 * - Strips trailing "Lay" or "Laya" (e.g. "Dhrut Lay" -> "Dhrut", "Vilambit Laya" -> "Vilambit")
 */
export function normalizeLayItem(lay: string): string {
  if (!lay) return "";
  const trimmed = lay.trim();
  if (trimmed.toLowerCase() === "madhyalay") {
    return "Madhyalay";
  }
  // Strip trailing "lay" or "laya" preceded by space
  const cleaned = trimmed.replace(/\s+lay(a)?$/i, "").trim();
  return cleaned || trimmed;
}

/**
 * Normalizes an array or comma-separated string of lay tempos
 */
export function normalizeLayArray(lay: any): string[] {
  if (!lay) return [];
  const rawList: string[] = Array.isArray(lay)
    ? lay.filter((item) => typeof item === "string")
    : typeof lay === "string"
    ? lay.split(",")
    : [];

  const cleaned = rawList.map(normalizeLayItem).filter(Boolean);
  return Array.from(new Set(cleaned));
}

/**
 * Strips honorific prefix titles from artist names:
 * E.g., "Pandit Bhimsen Joshi" -> "Bhimsen Joshi"
 *       "Pt. C. R. Vyas" -> "C. R. Vyas"
 *       "Ustad Amir Khan" -> "Amir Khan"
 *       "Vidushi Ashwini Bhide Deshpande" -> "Ashwini Bhide Deshpande"
 *       "Dr. Prabha Atre" -> "Prabha Atre"
 */
export function stripArtistTitles(name: string): string {
  if (!name) return "";
  let cleaned = name.trim();

  // Strip prefixes iteratively in case multiple honorifics exist (e.g. "Pandit Dr. ...")
  const titlePrefixRegex = /^(?:(pandit|pt\.?|pnt\.?|ustad|ust\.?|vidushi|vid\.?|dr\.?|shri|smt\.?)\s+)+/gi;
  cleaned = cleaned.replace(titlePrefixRegex, "").trim();

  return cleaned;
}
