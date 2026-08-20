"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function submitFeedback(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const orderRating = Number(formData.get("orderRating") ?? 0);
  const driverRating = Number(formData.get("driverRating") ?? 0);
  const feedback = String(formData.get("feedback") ?? "").trim();
  if (!orderId || orderRating < 1) redirect(`/orders/${orderId}`);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "delivered" || order.orderRating) {
    redirect(`/orders/${orderId}`);
  }
  await prisma.order.update({
    where: { id: orderId },
    data: {
      orderRating: Math.min(5, Math.max(1, orderRating)),
      driverRating: driverRating >= 1 ? Math.min(5, Math.max(1, driverRating)) : null,
      feedback: feedback || null,
    },
  });
  redirect(`/orders/${orderId}?rated=1`);
}
