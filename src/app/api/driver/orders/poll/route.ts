import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriver } from "@/lib/auth";

export async function GET() {
  const driver = await getDriver();
  if (!driver) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { driverId: driver.id, status: "delivering" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    count: orders.length,
    ids: orders.map((o) => o.id),
    fingerprint: `${orders.length}:${orders.map((o) => o.id).join(",")}`,
  });
}
