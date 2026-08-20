"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setDriverSession, clearDriverSession, getDriver } from "@/lib/auth";

export async function driverLogin(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const password = String(formData.get("password") ?? "");
  const driver = await prisma.driver.findUnique({ where: { phone } });
  if (!driver || driver.password !== password) {
    redirect("/driver/login?error=1");
  }
  await setDriverSession(driver.id);
  redirect("/driver");
}

export async function driverLogout() {
  await clearDriverSession();
  redirect("/driver/login");
}

export async function confirmDelivery(formData: FormData) {
  const driver = await getDriver();
  if (!driver) redirect("/driver/login");
  const orderId = String(formData.get("orderId") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.driverId !== driver.id || order.status !== "delivering") {
    redirect("/driver?error=1");
  }
  if (!order.deliveryCode || order.deliveryCode !== code) {
    redirect("/driver?error=code");
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "delivered", deliveredAt: new Date() },
  });
  redirect("/driver?done=1");
}
