import {
  queryGlobalSeoSettings,
  queryNavbarData,
} from "@workspace/sanity/query";

import { fetchSanity } from "@/lib/sanity/fetch";

import { NavbarClient, NavbarSkeleton } from "./navbar-client";

export { NavbarSkeleton };

export async function NavbarServer() {
  const [navbarData, settingsData] = await Promise.all([
    fetchSanity({ query: queryNavbarData }),
    fetchSanity({ query: queryGlobalSeoSettings }),
  ]);
  return <NavbarClient navbarData={navbarData} settingsData={settingsData} />;
}
