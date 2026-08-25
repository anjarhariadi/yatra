import { NextResponse } from "next/server";
import { readImage } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const image = await readImage(name);

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(image.body), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
