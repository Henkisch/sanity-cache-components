import { client } from "@workspace/sanity/client";
import {
  queryGlobalSeoSettings,
  queryNavbarData,
} from "@workspace/sanity/query";
import { cacheLife, cacheTag } from "next/cache";

import { extractRefs } from "./sanity/extract-refs";

export const getNavigationData = async () => {
  "use cache";
  cacheLife("max");

  const [navbarData, settingsData] = await Promise.all([
    client.fetch(queryNavbarData),
    client.fetch(queryGlobalSeoSettings),
  ]);

  cacheTag("navbar", "settings");

  const refs = [...extractRefs([navbarData, settingsData])];
  if (refs.length) cacheTag(...refs);

  return { navbarData, settingsData };
};
