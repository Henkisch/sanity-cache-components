import {
  queryBlogIndexPageBlogs,
  queryBlogIndexPageBlogsCount,
  queryBlogIndexPageData,
} from "@workspace/sanity/query";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { BlogHeader } from "@/components/blog-card";
import { BlogPageContent } from "@/components/blog-page-content";
import { PageBuilder } from "@/components/pagebuilder";
import { sanityFetch, sanityFetchPreview } from "@/lib/sanity/fetch";
import { getSEOMetadata } from "@/lib/seo";
import {
  calculatePaginationMetadata,
  getBlogPaginationStartEnd,
  handleErrors,
} from "@/utils";

async function fetchBlogIndexPageData(isDraftMode: boolean) {
  if (isDraftMode) {
    return sanityFetchPreview({ query: queryBlogIndexPageData });
  }
  return sanityFetch({ query: queryBlogIndexPageData, tags: ["blogIndex"] });
}

async function fetchBlogIndexPageBlogs(
  start: number,
  end: number,
  isDraftMode: boolean,
) {
  if (isDraftMode) {
    return sanityFetchPreview({
      query: queryBlogIndexPageBlogs,
      params: { start, end },
    });
  }
  return sanityFetch({
    query: queryBlogIndexPageBlogs,
    params: { start, end },
    tags: ["blog"],
  });
}

async function fetchBlogIndexPageBlogsCount(isDraftMode: boolean) {
  if (isDraftMode) {
    return sanityFetchPreview({ query: queryBlogIndexPageBlogsCount });
  }
  return sanityFetch({
    query: queryBlogIndexPageBlogsCount,
    tags: ["blog"],
  });
}

export async function generateMetadata() {
  const { isEnabled: isDraftMode } = await draftMode();
  const result = await fetchBlogIndexPageData(isDraftMode);
  return getSEOMetadata({
    title: result?.title ?? result?.seoTitle,
    description: result?.description ?? result?.seoDescription,
    slug: "/blog",
    contentId: result?._id,
    contentType: result?._type,
  });
}

type BlogPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const { page } = await searchParams;
  const currentPage = page ? Number(page) : 1;
  const { isEnabled: isDraftMode } = await draftMode();

  const [[indexPageData, errIndexPageData], [totalCount, errTotalCount]] =
    await Promise.all([
      handleErrors(fetchBlogIndexPageData(isDraftMode)),
      handleErrors(fetchBlogIndexPageBlogsCount(isDraftMode)),
    ]);

  if (errIndexPageData || !indexPageData) {
    notFound();
  }

  if (errTotalCount || totalCount === null || totalCount === undefined) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader
          description={indexPageData.description}
          title={indexPageData.title}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Unable to load blog posts at the moment.
          </p>
        </div>
        {indexPageData.pageBuilder && indexPageData.pageBuilder.length > 0 && (
          <PageBuilder
            id={indexPageData._id}
            pageBuilder={indexPageData.pageBuilder}
            type={indexPageData._type}
          />
        )}
      </main>
    );
  }

  const featuredBlogsCount = indexPageData.displayFeaturedBlogs
    ? Number(indexPageData.featuredBlogsCount) || 0
    : 0;

  const paginationMetadata = calculatePaginationMetadata(
    totalCount,
    currentPage,
  );

  const { start, end } = getBlogPaginationStartEnd(currentPage);
  const blogStart = currentPage === 1 ? 0 : start + featuredBlogsCount;
  const blogEnd = end + featuredBlogsCount;

  const [blogs, errBlogs] = await handleErrors(
    fetchBlogIndexPageBlogs(blogStart, blogEnd, isDraftMode),
  );

  if (errBlogs || !blogs) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader
          description={indexPageData.description}
          title={indexPageData.title}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No blog posts available at the moment.
          </p>
        </div>
        {indexPageData.pageBuilder && indexPageData.pageBuilder.length > 0 && (
          <PageBuilder
            id={indexPageData._id}
            pageBuilder={indexPageData.pageBuilder}
            type={indexPageData._type}
          />
        )}
      </main>
    );
  }

  return (
    <BlogPageContent
      blogs={blogs}
      indexPageData={indexPageData}
      paginationMetadata={paginationMetadata}
    />
  );
}
