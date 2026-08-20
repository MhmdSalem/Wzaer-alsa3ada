import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, lat: true, lng: true, driverId: true },
  });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  const driverLocation = order.driverId
    ? await prisma.driverLocation.findUnique({
        where: { driverId_orderId: { driverId: order.driverId, orderId: order.id } },
      })
    : null;
  return NextResponse.json({
    status: order.status,
    customer: { lat: order.lat, lng: order.lng },
    driver: driverLocation
      ? {
          lat: driverLocation.lat,
          lng: driverLocation.lng,
          updatedAt: driverLocation.updatedAt,
          heading: driverLocation.heading,
          speed: driverLocation.speed,
        }
      : null,
    fingerprint: `${order.status}:${driverLocation?.updatedAt.toISOString() ?? ""}`,
  });
}
