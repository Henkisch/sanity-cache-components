import { querySettingsData } from "@workspace/sanity/query";
import { cacheLife, cacheTag } from "next/cache";

import { buildCacheTags, fetchSanity } from "@/lib/sanity/fetch";
import { CombinedJsonLd } from "./json-ld";

export async function JsonLdServer() {
  "use cache";
  cacheLife(process.env.NODE_ENV === "production" ? "max" : "seconds");

  const settings = await fetchSanity({ query: querySettingsData });

  cacheTag(...buildCacheTags(settings, ["settings"]));

  return (
    <CombinedJsonLd includeOrganization includeWebsite settings={settings} />
  );
}
