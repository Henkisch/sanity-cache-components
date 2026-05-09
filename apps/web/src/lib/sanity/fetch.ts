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

/**
 * Published content fetch — cached with Cache Components.
 *
 * Tags applied automatically:
 * 1. Explicit type-level tags passed by caller e.g. ['page', 'blog']
 * 2. doc:{_id} for the returned document's own ID (single-document queries)
 * 3. doc:{_ref} for every reference found in the response
 */
export async function sanityFetch<const Q extends string>({
  query,
  params = {},
  tags = [],
}: {
  query: Q;
  params?: QueryParams;
  tags?: string[];
}): Promise<ClientReturn<Q>> {
  "use cache";
  cacheLife("max");

  const data = await client.fetch<ClientReturn<Q>>(query, params);

  const appliedTags: string[] = [...tags];

  const asRecord = data as Record<string, unknown>;
  if (typeof asRecord?._id === "string") {
    appliedTags.push(`doc:${asRecord._id}`);
  }

  const refs = [...extractRefs(data)];
  appliedTags.push(...refs);

  if (appliedTags.length) cacheTag(...appliedTags);

  console.log(
    `[sanityFetch] tags=${JSON.stringify(appliedTags)} refs=${refs.length} query=${query.slice(0, 60).replace(/\s+/g, " ")}...`,
  );

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
