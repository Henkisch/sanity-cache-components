import "server-only";

import type { ClientReturn, QueryParams } from "@sanity/client";
import { env as clientEnv } from "@workspace/env/client";
import { env as serverEnv } from "@workspace/env/server";
import { client } from "@workspace/sanity/client";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "next-sanity";

import { extractRefs } from "./extract-refs";

const previewClient = createClient({
  projectId: clientEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: clientEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: clientEnv.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: serverEnv.SANITY_API_READ_TOKEN,
  stega: {
    studioUrl: clientEnv.NEXT_PUBLIC_SANITY_STUDIO_URL,
  },
});

const isProd = process.env.NODE_ENV === "production";

/**
 * Raw fetch — no "use cache", no tag propagation.
 * Use this inside "use cache" components so their tags don't bleed into
 * the parent cache scope. The component itself owns its own cacheTag() calls.
 */
export async function fetchSanity<const Q extends string>({
  query,
  params = {},
}: {
  query: Q;
  params?: QueryParams;
}): Promise<ClientReturn<Q>> {
  return client.fetch<ClientReturn<Q>>(query, params, {
    perspective: "published",
    cache: "no-store",
  });
}

/**
 * Builds a deduplicated tag array from a document.
 * Adds doc:{_id} for the document itself and doc:{_ref} for every reference.
 */
export function buildCacheTags(data: unknown): string[] {
  const tags = new Set<string>();
  const asRecord = data as Record<string, unknown>;
  if (typeof asRecord?._id === "string") tags.add(`doc:${asRecord._id}`);
  for (const ref of extractRefs(data)) tags.add(ref);
  return [...tags];
}

/**
 * Published content fetch — cached with Cache Components.
 * Tags applied automatically: doc:{_id} and doc:{_ref} for every reference.
 */
export async function sanityFetch<const Q extends string>({
  query,
  params = {},
}: {
  query: Q;
  params?: QueryParams;
}): Promise<ClientReturn<Q>> {
  "use cache";
  cacheLife(isProd ? "max" : "seconds");

  const data = await client.fetch<ClientReturn<Q>>(query, params, {
    perspective: "published",
    cache: "no-store",
  });

  const appliedTags = buildCacheTags(data);
  if (appliedTags.length) cacheTag(...appliedTags);

  return data;
}

/**
 * Preview fetch — never cached, always fresh draft content.
 * Used when Next.js Draft Mode is active (inside Presentation Tool).
 */
export async function sanityFetchPreview<const Q extends string>({
  query,
  params = {},
}: {
  query: Q;
  params?: QueryParams;
}): Promise<ClientReturn<Q>> {
  return previewClient.fetch<ClientReturn<Q>>(query, params, {
    perspective: "drafts",
    cache: "no-store",
  });
}
