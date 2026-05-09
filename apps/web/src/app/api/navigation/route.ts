import { NextResponse } from "next/server";

import { getNavigationData } from "@/lib/navigation";

export async function GET() {
  const data = await getNavigationData();
  return NextResponse.json(data);
}
