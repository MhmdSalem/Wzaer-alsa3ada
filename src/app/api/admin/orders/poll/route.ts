import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [count, latest] = await Promise.all([
    prisma.order.count(),
    prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, status: true },
    }),
  ]);
  return NextResponse.json({
    count,
    latest,
    fingerprint: `${count}:${latest?.id ?? ""}:${latest?.status ?? ""}`,
  });
}
