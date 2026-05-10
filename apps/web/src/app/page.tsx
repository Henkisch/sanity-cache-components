import { queryHomePageData } from "@workspace/sanity/query";
import { draftMode } from "next/headers";
import { Suspense } from "react";

import { PageBuilder } from "@/components/pagebuilder";
import { sanityFetch, sanityFetchPreview } from "@/lib/sanity/fetch";
import { getSEOMetadata } from "@/lib/seo";

async function fetchHomePageData() {
  const { isEnabled: isDraftMode } = await draftMode();
  if (isDraftMode) {
    return sanityFetchPreview({ query: queryHomePageData });
  }
  return sanityFetch({ query: queryHomePageData, tags: ["homePage"] });
}

export async function generateMetadata() {
  const homePageData = await fetchHomePageData();
  return getSEOMetadata({
    title: homePageData?.title ?? homePageData?.seoTitle,
    description: homePageData?.description ?? homePageData?.seoDescription,
    slug: "/",
    contentId: homePageData?._id,
    contentType: homePageData?._type,
  });
}

async function HomePageContent() {
  const homePageData = await fetchHomePageData();

  if (!homePageData) {
    return <div>No home page data</div>;
  }

  const { _id, _type, pageBuilder } = homePageData;

  return <PageBuilder id={_id} pageBuilder={pageBuilder ?? []} type={_type} />;
}

export default function Page() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
