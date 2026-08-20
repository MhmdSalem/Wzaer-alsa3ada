import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";

export async function GET() {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const messages = await prisma.chatMessage.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  await prisma.chatMessage.updateMany({
    where: { customerId: customer.id, fromAdmin: true, readByCustomer: false },
    data: { readByCustomer: true },
  });
  const latest = messages[messages.length - 1];
  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      fromAdmin: m.fromAdmin,
      at: m.createdAt.toISOString(),
    })),
    fingerprint: `${messages.length}:${latest?.id ?? ""}`,
  });
}

export async function POST(request: NextRequest) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await request.json()) as { body?: string };
  const text = (body.body ?? "").trim().slice(0, 1000);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  await prisma.chatMessage.create({
    data: {
      customerId: customer.id,
      body: text,
      fromAdmin: false,
      readByCustomer: true,
    },
  });
  return NextResponse.json({ ok: true });
}
