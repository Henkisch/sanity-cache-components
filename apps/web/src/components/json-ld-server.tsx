import { querySettingsData } from "@workspace/sanity/query";
import { cacheLife } from "next/cache";

import { sanityFetch } from "@/lib/sanity/fetch";
import { CombinedJsonLd } from "./json-ld";

export async function JsonLdServer() {
  "use cache";
  cacheLife("max");

  const settings = await sanityFetch({
    query: querySettingsData,
    tags: ["settings"],
  });

  return (
    <CombinedJsonLd includeOrganization includeWebsite settings={settings} />
  );
}
