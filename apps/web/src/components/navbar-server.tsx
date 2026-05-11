import {
  queryGlobalSeoSettings,
  queryNavbarData,
} from "@workspace/sanity/query";
import { cacheLife, cacheTag } from "next/cache";

import { docTag, fetchSanity } from "@/lib/sanity/fetch";

import { NavbarClient, NavbarSkeleton } from "./navbar-client";

export { NavbarSkeleton };

export async function NavbarServer() {
  "use cache";
  cacheLife(process.env.NODE_ENV === "production" ? "max" : "seconds");

  const [navbarData, settingsData] = await Promise.all([
    fetchSanity({ query: queryNavbarData }),
    fetchSanity({ query: queryGlobalSeoSettings }),
  ]);

  const tags = [docTag(navbarData), docTag(settingsData)].filter(
    (t): t is string => t !== null
  );
  if (tags.length) cacheTag(...tags);

  return <NavbarClient navbarData={navbarData} settingsData={settingsData} />;
}
