import { prisma } from "@/lib/prisma";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersAdmin() {
  const [orders, drivers, count, latest] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { driver: true, customer: true } }),
    prisma.driver.findMany({ orderBy: { name: "asc" } }),
    prisma.order.count(),
    prisma.order.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true, status: true } }),
  ]);

  return (
    <OrdersClient
      drivers={drivers.map((d) => ({ id: d.id, name: d.name }))}
      fingerprint={`${count}:${latest?.id ?? ""}:${latest?.status ?? ""}`}
      orders={orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        createdAtLabel: order.createdAt.toLocaleString("ar-EG"),
        customerName: order.customerName,
        customerId: order.customerId,
        walletBalance: order.customer?.walletBalance ?? null,
        phone: order.phone,
        address: order.address,
        payment: order.payment,
        fulfillment: order.fulfillment,
        paymentProof: order.paymentProof,
        rejectReason: order.rejectReason,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        itemsCount: (JSON.parse(order.items) as unknown[]).length,
        deliveryCode: order.deliveryCode,
        driverId: order.driverId,
        driverName: order.driver?.name ?? null,
        orderRating: order.orderRating,
        driverRating: order.driverRating,
        refundAmount: order.refundAmount,
        refundMethod: order.refundMethod,
        refundStatus: order.refundStatus,
      }))}
    />
  );
}
