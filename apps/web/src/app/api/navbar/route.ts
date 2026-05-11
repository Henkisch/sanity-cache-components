import { queryGlobalSeoSettings, queryNavbarData } from "@workspace/sanity/query";
import { cacheLife, cacheTag } from "next/cache";
import { NextResponse } from "next/server";

import { buildCacheTags, fetchSanity } from "@/lib/sanity/fetch";

async function getNavbarApiData() {
  "use cache";
  cacheLife(process.env.NODE_ENV === "production" ? "max" : "seconds");

  const [navbarData, settingsData] = await Promise.all([
    fetchSanity({ query: queryNavbarData }),
    fetchSanity({ query: queryGlobalSeoSettings }),
  ]);

  const tags = [...buildCacheTags(navbarData), ...buildCacheTags(settingsData)];
  if (tags.length) cacheTag(...tags);

  return { navbarData, settingsData };
}

export async function GET() {
  const data = await getNavbarApiData();
  return NextResponse.json(data);
}
