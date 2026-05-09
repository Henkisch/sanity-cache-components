import { Logger } from "@workspace/logger";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

const logger = new Logger("Revalidate");

// Types that affect global navigation — bust everything
const GLOBAL_TYPES = ["navbar", "footer", "settings"];

// Types that should also bust the homepage when changed
const HOME_FEED_TYPES = ["blog", "page"];

// Map _type to tag namespace if they differ from _type itself
const TYPE_NAMESPACE: Record<string, string> = {
  blogPost: "blog",
};

export async function POST(request: NextRequest) {
  const { isValidSignature, body } = await parseBody(
    request,
    process.env.SANITY_WEBHOOK_SECRET
  );

  if (!isValidSignature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!body?._id || !body?._type) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { _id, _type } = body;
  const ns = TYPE_NAMESPACE[_type] ?? _type;
  const tags: string[] = [];
  let reason: string;

  if (GLOBAL_TYPES.includes(_type)) {
    tags.push("global");
    reason = `${_type} changed → bust global`;
  } else {
    tags.push(`doc:${_id}`);
    reason = `${_type} changed → precise bust doc:${_id}`;
  }

  tags.push(ns);

  if (HOME_FEED_TYPES.includes(_type)) {
    tags.push("home");
    reason += " + home";
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  logger.info(`${reason} | tags=${JSON.stringify(tags)}`);

  return NextResponse.json({ revalidated: true, tags });
}
