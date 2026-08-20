import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriver } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const driver = await getDriver();
  if (!driver) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    orderIds?: string[];
    lat?: number;
    lng?: number;
    heading?: number;
    speed?: number;
  };
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "invalid coordinates" }, { status: 400 });
  }
  const ids = Array.isArray(body.orderIds)
    ? body.orderIds.map((id) => String(id).trim()).filter(Boolean)
    : [];
  if (!ids.length) return NextResponse.json({ ok: true });

  await Promise.all(
    ids.map((orderId) =>
      prisma.driverLocation.upsert({
        where: { driverId_orderId: { driverId: driver.id, orderId } },
        update: {
          lat,
          lng,
          heading: Number.isFinite(body.heading) ? Number(body.heading) : null,
          speed: Number.isFinite(body.speed) ? Number(body.speed) : null,
        },
        create: {
          driverId: driver.id,
          orderId,
          lat,
          lng,
          heading: Number.isFinite(body.heading) ? Number(body.heading) : null,
          speed: Number.isFinite(body.speed) ? Number(body.speed) : null,
        },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
