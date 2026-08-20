import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".png";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  const url = `/uploads/${name}`;
  await prisma.media.create({ data: { url, name: file.name } });
  return NextResponse.json({ url });
}
