import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "images only" }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "too large" }, { status: 400 });
  }
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  const url = `/uploads/${name}`;
  await prisma.media.create({ data: { url, name: file.name } });
  return NextResponse.json({ url });
}
