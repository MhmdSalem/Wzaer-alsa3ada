import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, deliveredAt: true, orderRating: true },
  });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    ...order,
    fingerprint: `${order.status}:${order.orderRating ?? ""}`,
  });
}
