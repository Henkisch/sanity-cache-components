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
  const tags: string[] = [];

  switch (_type) {
    case "settings":
      // settings is used in navbar and footer — bust all three
      tags.push("settings", "navbar", "footer");
      break;
    case "navbar":
      tags.push("navbar", `doc:${_id}`);
      break;
    case "footer":
      tags.push("footer", `doc:${_id}`);
      break;
    case "homePage":
      tags.push("homePage", `doc:${_id}`);
      break;
    default:
      tags.push(_type, `doc:${_id}`);
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  logger.info(`${_type} changed | tags=${JSON.stringify(tags)}`);

  return NextResponse.json({ revalidated: true, tags });
}
