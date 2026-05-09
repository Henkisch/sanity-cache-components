import { Logger } from "@workspace/logger";
import { client } from "@workspace/sanity/client";
import { queryBlogPaths, queryBlogSlugPageData } from "@workspace/sanity/query";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { RichText } from "@/components/elements/rich-text";
import { SanityImage } from "@/components/elements/sanity-image";
import { TableOfContent } from "@/components/elements/table-of-content";
import { ArticleJsonLd } from "@/components/json-ld";
import { sanityFetch, sanityFetchPreview } from "@/lib/sanity/fetch";
import { getSEOMetadata } from "@/lib/seo";

const logger = new Logger("BlogSlug");

async function fetchBlogSlugPageData(slug: string, isDraftMode: boolean) {
  if (isDraftMode) {
    return sanityFetchPreview({ query: queryBlogSlugPageData, params: { slug } });
  }
  return sanityFetch({
    query: queryBlogSlugPageData,
    params: { slug },
    tags: ["blog"],
  });
}

async function fetchBlogPaths() {
  try {
    const slugs = await client.fetch(queryBlogPaths);

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return [];
    }

    const paths: { slug: string }[] = [];
    for (const slug of slugs) {
      if (!slug) {
        continue;
      }
      const [, , path] = slug.split("/");
      if (path) {
        paths.push({ slug: path });
      }
    }
    return paths;
  } catch (error) {
    logger.error("Error fetching blog paths", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slugString = `/blog/${slug}`;
  const { isEnabled: isDraftMode } = await draftMode();
  const data = await fetchBlogSlugPageData(slugString, isDraftMode);
  return getSEOMetadata({
    title: data?.title ?? data?.seoTitle,
    description: data?.description ?? data?.seoDescription,
    slug: slugString,
    contentId: data?._id,
    contentType: data?._type,
    pageType: "article",
  });
}

export async function generateStaticParams() {
  const paths = await fetchBlogPaths();
  return paths;
}

export const dynamicParams = true;

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slugString = `/blog/${slug}`;
  const { isEnabled: isDraftMode } = await draftMode();
  const data = await fetchBlogSlugPageData(slugString, isDraftMode);

  if (!data) {
    return notFound();
  }

  const { title, description, image, richText } = data;

  return (
    <div className="container mx-auto my-16 px-4 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <ArticleJsonLd article={data} />
          <header className="mb-8">
            <h1 className="mt-2 font-bold text-4xl">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </header>
          {image && (
            <div className="mb-12">
              <SanityImage
                alt={title}
                className="h-auto w-full rounded-lg"
                height={900}
                image={image}
                loading="eager"
                width={1600}
              />
            </div>
          )}
          <RichText richText={richText} />
        </main>

        <div className="hidden lg:block">
          <div className="sticky top-4 rounded-lg">
            <TableOfContent richText={richText ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
