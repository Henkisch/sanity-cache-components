import { Logger } from "@workspace/logger";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

const logger = new Logger("Revalidate");

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
  const tag = `doc:${_id}`;

  revalidateTag(tag, "max");

  logger.info(`${_type} changed | tags=["${tag}"]`);

  return NextResponse.json({ revalidated: true, tags: [tag] });
}
