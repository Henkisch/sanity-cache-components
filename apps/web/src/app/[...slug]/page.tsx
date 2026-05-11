import { Logger } from "@workspace/logger";
import { client } from "@workspace/sanity/client";
import { querySlugPageData, querySlugPagePaths } from "@workspace/sanity/query";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageBuilder } from "@/components/pagebuilder";
import { sanityFetch, sanityFetchPreview } from "@/lib/sanity/fetch";
import { getSEOMetadata } from "@/lib/seo";

const logger = new Logger("PageSlug");

async function fetchSlugPageData(slug: string, isDraftMode: boolean) {
  if (isDraftMode) {
    return sanityFetchPreview({ query: querySlugPageData, params: { slug } });
  }
  return sanityFetch({ query: querySlugPageData, params: { slug } });
}

async function fetchSlugPagePaths() {
  try {
    const slugs = await client.fetch(querySlugPagePaths);

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return [];
    }

    const paths: { slug: string[] }[] = [];
    for (const slug of slugs) {
      if (!slug) {
        continue;
      }
      const parts = slug.split("/").filter(Boolean);
      paths.push({ slug: parts });
    }
    return paths;
  } catch (error) {
    logger.error("Error fetching slug paths", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugString = `/${slug.join("/")}`;
  const { isEnabled: isDraftMode } = await draftMode();
  const pageData = await fetchSlugPageData(slugString, isDraftMode);

  return getSEOMetadata({
    title: pageData?.title ?? pageData?.seoTitle,
    description: pageData?.description ?? pageData?.seoDescription,
    slug: slugString,
    contentId: pageData?._id,
    contentType: pageData?._type,
  });
}

export async function generateStaticParams() {
  const paths = await fetchSlugPagePaths();
  return paths;
}

async function SlugPageContent({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugString = `/${slug.join("/")}`;
  const { isEnabled: isDraftMode } = await draftMode();
  const pageData = await fetchSlugPageData(slugString, isDraftMode);

  if (!pageData) {
    return notFound();
  }

  const { title, pageBuilder, _id, _type } = pageData;

  return !Array.isArray(pageBuilder) || pageBuilder?.length === 0 ? (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-semibold text-2xl capitalize">{title}</h1>
      <p className="mb-6 text-muted-foreground">
        This page has no content blocks yet.
      </p>
    </div>
  ) : (
    <PageBuilder id={_id} pageBuilder={pageBuilder} type={_type} />
  );
}

export default function SlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  return (
    <Suspense>
      <SlugPageContent params={params} />
    </Suspense>
  );
}
