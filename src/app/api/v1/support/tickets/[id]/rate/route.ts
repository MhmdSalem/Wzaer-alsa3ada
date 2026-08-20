import { NextRequest, NextResponse } from "next/server";
import { getCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const ticket = await prisma.supportTicket.findFirst({
    where: { id, customerId: customer.id },
    select: { status: true, rating: true },
  });
  if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (ticket.status !== "closed") return NextResponse.json({ error: "ticket not closed" }, { status: 409 });
  if (ticket.rating) return NextResponse.json({ error: "already rated" }, { status: 409 });

  const body = (await request.json()) as { rating?: number; comment?: string };
  const rating = Math.max(1, Math.min(5, Number(body.rating) || 0));
  const comment = String(body.comment ?? "").trim().slice(0, 500);
  if (!rating) return NextResponse.json({ error: "rating required" }, { status: 400 });

  await prisma.supportTicket.update({
    where: { id },
    data: {
      rating,
      ratingComment: comment || null,
    },
  });

  return NextResponse.json({ ok: true });
}
