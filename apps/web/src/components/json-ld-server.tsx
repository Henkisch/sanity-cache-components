import { querySettingsData } from "@workspace/sanity/query";
import { cacheLife, cacheTag } from "next/cache";

import { docTag, fetchSanity } from "@/lib/sanity/fetch";
import { CombinedJsonLd } from "./json-ld";

export async function JsonLdServer() {
  "use cache";
  cacheLife(process.env.NODE_ENV === "production" ? "max" : "seconds");

  const settings = await fetchSanity({ query: querySettingsData });
  const tag = docTag(settings);
  if (tag) cacheTag(tag);

  return (
    <CombinedJsonLd includeOrganization includeWebsite settings={settings} />
  );
}
