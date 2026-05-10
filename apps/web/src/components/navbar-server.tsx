import {
  queryGlobalSeoSettings,
  queryNavbarData,
} from "@workspace/sanity/query";
import { cacheLife } from "next/cache";

import { sanityFetch } from "@/lib/sanity/fetch";

import { NavbarClient, NavbarSkeleton } from "./navbar-client";

export { NavbarSkeleton };

export async function NavbarServer() {
  "use cache";
  cacheLife("max");

  const [navbarData, settingsData] = await Promise.all([
    sanityFetch({ query: queryNavbarData, tags: ["navbar"] }),
    sanityFetch({ query: queryGlobalSeoSettings, tags: ["settings"] }),
  ]);

  return <NavbarClient navbarData={navbarData} settingsData={settingsData} />;
}
