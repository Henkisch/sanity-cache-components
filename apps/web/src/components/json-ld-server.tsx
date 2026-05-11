import { querySettingsData } from "@workspace/sanity/query";
import { cacheLife, cacheTag } from "next/cache";

import { buildCacheTags, fetchSanity } from "@/lib/sanity/fetch";
import { CombinedJsonLd } from "./json-ld";

async function getJsonLdSettingsData() {
  "use cache";
  cacheLife(process.env.NODE_ENV === "production" ? "max" : "seconds");
  const data = await fetchSanity({ query: querySettingsData });
  cacheTag(...buildCacheTags(data));
  return data;
}

export async function JsonLdServer() {
  const settings = await getJsonLdSettingsData();
  return (
    <CombinedJsonLd includeOrganization includeWebsite settings={settings} />
  );
}
