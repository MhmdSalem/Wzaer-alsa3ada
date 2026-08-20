import { NextRequest, NextResponse } from "next/server";
import { getCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const tickets = await prisma.supportTicket.findMany({
    where: { customerId: customer.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 120,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  await prisma.supportMessage.updateMany({
    where: {
      ticket: { customerId: customer.id },
      fromAdmin: true,
      readByCustomer: false,
    },
    data: { readByCustomer: true },
  });

  return NextResponse.json({
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      closedAt: ticket.closedAt?.toISOString() ?? null,
      rating: ticket.rating,
      ratingComment: ticket.ratingComment,
      messages: ticket.messages.map((message) => ({
        id: message.id,
        body: message.body,
        imageUrl: message.imageUrl,
        fromAdmin: message.fromAdmin,
        isAuto: message.isAuto,
        createdAt: message.createdAt.toISOString(),
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json()) as { subject?: string; message?: string };
  const subject = String(body.subject ?? "استفسار عام").trim().slice(0, 120) || "استفسار عام";
  const message = String(body.message ?? "").trim().slice(0, 1500);
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const latestOpen = await prisma.supportTicket.findFirst({
    where: { customerId: customer.id, status: "open" },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (latestOpen) {
    return NextResponse.json({ error: "open ticket exists", ticketId: latestOpen.id }, { status: 409 });
  }

  const setting = await prisma.setting.findUnique({
    where: { id: "main" },
    select: { chatAutoReply: true },
  });
  const autoReply =
    setting?.chatAutoReply?.trim() ||
    "أهلا بيك! فتحنا تذكرة لدعمك وهنتابع معاك لحد ما المشكلة تتحل.";

  const ticket = await prisma.supportTicket.create({
    data: {
      customerId: customer.id,
      subject,
      messages: {
        create: [
          {
            body: message,
            fromAdmin: false,
            readByCustomer: true,
          },
          {
            body: autoReply,
            fromAdmin: true,
            isAuto: true,
            readByAdmin: true,
          },
        ],
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      closedAt: ticket.closedAt?.toISOString() ?? null,
      rating: ticket.rating,
      ratingComment: ticket.ratingComment,
      messages: ticket.messages.map((m) => ({
        id: m.id,
        body: m.body,
        imageUrl: m.imageUrl,
        fromAdmin: m.fromAdmin,
        isAuto: m.isAuto,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}
