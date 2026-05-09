/**
 * Recursively walks a Sanity API response and collects genuine document _refs.
 *
 * We collect _ref (not _id) because:
 * - _id = this document itself, already covered by the type-level tag
 * - _ref = pointer to another document that influenced this page's output
 *
 * Filters:
 * - Must be _type: 'reference' — all Sanity document refs are
 * - Excludes asset IDs (image- / file- prefix) — no need to invalidate
 *   pages when an image asset document changes
 * - Portable text internal links are caught since they use _type: 'reference'
 *
 * Returns tags prefixed with "doc:" to avoid collisions with manual tags.
 */
export function extractRefs(
  data: unknown,
  refs = new Set<string>(),
): Set<string> {
  if (!data || typeof data !== "object") return refs;
  if (Array.isArray(data)) {
    data.forEach((item) => extractRefs(item, refs));
    return refs;
  }
  const obj = data as Record<string, unknown>;
  if (
    typeof obj._ref === "string" &&
    obj._type === "reference" &&
    !obj._ref.startsWith("image-") &&
    !obj._ref.startsWith("file-")
  ) {
    refs.add(`doc:${obj._ref}`);
  }
  Object.values(obj).forEach((val) => extractRefs(val, refs));
  return refs;
}
