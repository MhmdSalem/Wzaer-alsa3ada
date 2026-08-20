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
    select: { id: true, status: true },
  });
  if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (ticket.status !== "open") return NextResponse.json({ error: "ticket closed" }, { status: 409 });

  const body = (await request.json()) as { message?: string; imageUrl?: string };
  const message = String(body.message ?? "").trim().slice(0, 1500);
  const imageUrl = String(body.imageUrl ?? "").trim().slice(0, 500);
  if (!message && !imageUrl) return NextResponse.json({ error: "message or image required" }, { status: 400 });

  await prisma.supportMessage.create({
    data: {
      ticketId: id,
      body: message || "صورة مرفقة",
      imageUrl: imageUrl || null,
      fromAdmin: false,
      readByCustomer: true,
    },
  });
  await prisma.supportTicket.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
