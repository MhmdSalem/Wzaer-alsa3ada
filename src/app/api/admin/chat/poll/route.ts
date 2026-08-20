import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [unread, latest] = await Promise.all([
    prisma.supportMessage.count({
      where: {
        fromAdmin: false,
        readByAdmin: false,
        ticket: { status: "open" },
      },
    }),
    prisma.supportMessage.findFirst({
      where: { ticket: { status: "open" } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
  ]);
  return NextResponse.json({ unread, fingerprint: `${unread}:${latest?.id ?? ""}` });
}
