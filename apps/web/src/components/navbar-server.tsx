import {
  queryGlobalSeoSettings,
  queryNavbarData,
} from "@workspace/sanity/query";
import { cacheLife, cacheTag } from "next/cache";

import { buildCacheTags, fetchSanity } from "@/lib/sanity/fetch";

import { NavbarClient, NavbarSkeleton } from "./navbar-client";

export { NavbarSkeleton };

async function getNavbarData() {
  "use cache";
  cacheLife(process.env.NODE_ENV === "production" ? "max" : "seconds");
  const data = await fetchSanity({ query: queryNavbarData });
  cacheTag(...buildCacheTags(data, ["navbar"]));
  return data;
}

async function getNavbarSettingsData() {
  "use cache";
  cacheLife(process.env.NODE_ENV === "production" ? "max" : "seconds");
  const data = await fetchSanity({ query: queryGlobalSeoSettings });
  cacheTag(...buildCacheTags(data, ["settings"]));
  return data;
}

export async function NavbarServer() {
  const [navbarData, settingsData] = await Promise.all([
    getNavbarData(),
    getNavbarSettingsData(),
  ]);
  return <NavbarClient navbarData={navbarData} settingsData={settingsData} />;
}
