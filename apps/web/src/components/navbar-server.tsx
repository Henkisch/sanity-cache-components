import {
  queryGlobalSeoSettings,
  queryNavbarData,
} from "@workspace/sanity/query";
import { cacheLife, cacheTag } from "next/cache";

import { buildCacheTags, fetchSanity } from "@/lib/sanity/fetch";

import { NavbarClient, NavbarSkeleton } from "./navbar-client";

export { NavbarSkeleton };

export async function NavbarServer() {
  "use cache";
  cacheLife(process.env.NODE_ENV === "production" ? "max" : "seconds");

  const [navbarData, settingsData] = await Promise.all([
    fetchSanity({ query: queryNavbarData }),
    fetchSanity({ query: queryGlobalSeoSettings }),
  ]);

  cacheTag(...buildCacheTags(navbarData, ["navbar"]));

  return <NavbarClient navbarData={navbarData} settingsData={settingsData} />;
}
