"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, setAdminSession, clearAdminSession, getAdminUser } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    redirect("/admin/login?error=1");
  }
  await setAdminSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  await prisma.setting.upsert({
    where: { id: "main" },
    update: {
      storeName: String(formData.get("storeName") ?? ""),
      slogan: String(formData.get("slogan") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      city: String(formData.get("city") ?? ""),
      governorate: String(formData.get("governorate") ?? ""),
      country: String(formData.get("country") ?? ""),
      deliveryMinutes: Number(formData.get("deliveryMinutes") ?? 30),
      logoUrl: String(formData.get("logoUrl") ?? "/brand/logo-cart.png"),
      vodafoneCash: String(formData.get("vodafoneCash") ?? ""),
      instapay: String(formData.get("instapay") ?? ""),
      chatAutoReply: String(formData.get("chatAutoReply") ?? ""),
      storeLat: Number(formData.get("storeLat") ?? 30.7301) || 30.7301,
      storeLng: Number(formData.get("storeLng") ?? 31.7903) || 31.7903,
      deliveryBaseFee: Number(formData.get("deliveryBaseFee") ?? 15) || 0,
      deliveryPerKm: Number(formData.get("deliveryPerKm") ?? 2.5) || 0,
      freeDeliveryAbove: Number(formData.get("freeDeliveryAbove") ?? 0) || 0,
    },
    create: { id: "main" },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function approvePayment(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.order.updateMany({
    where: { id, status: "payment_review" },
    data: { status: "new" },
  });
  revalidatePath("/admin/orders");
}

export async function rejectOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  await prisma.order.update({
    where: { id },
    data: { status: "rejected", rejectReason: reason || "مشكلة في تأكيد التحويل" },
  });
  revalidatePath("/admin/orders");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || `p-${Date.now()}`);
  const data = {
    name: String(formData.get("name") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    image: String(formData.get("image") ?? ""),
    price: Number(formData.get("price") ?? 0),
    categoryId: String(formData.get("categoryId") ?? ""),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  };
  await prisma.product.upsert({ where: { id }, update: data, create: { id, ...data } });
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/products");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || String(formData.get("slug")));
  const parentId = String(formData.get("parentId") ?? "");
  const data = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    image: String(formData.get("image") ?? ""),
    parentId: parentId || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
  await prisma.category.upsert({ where: { id }, update: data, create: { id, ...data } });
  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/categories");
}

export async function saveOffer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const hours = Number(formData.get("hours") ?? 72);
  const customEnd = String(formData.get("endsAt") ?? "");
  const startsAt = new Date();
  const endsAt = customEnd ? new Date(customEnd) : new Date(Date.now() + hours * 3600_000);
  const bundleQty = Number(formData.get("bundleQty") ?? 0) || null;
  const data = {
    productId: String(formData.get("productId") ?? ""),
    image: String(formData.get("image") ?? "") || null,
    priceBefore: Number(formData.get("priceBefore") ?? 0),
    priceAfter: Number(formData.get("priceAfter") ?? 0),
    bundleQty,
    bundleBefore: Number(formData.get("bundleBefore") ?? 0) || null,
    bundlePrice: Number(formData.get("bundlePrice") ?? 0) || null,
    startsAt,
    endsAt,
    published: formData.get("published") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
  if (id) {
    await prisma.offer.update({ where: { id }, data });
  } else {
    await prisma.offer.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/admin/offers");
  redirect("/admin/offers");
}

export async function deleteOffer(formData: FormData) {
  await requireAdmin();
  await prisma.offer.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/");
  revalidatePath("/admin/offers");
}

export async function saveAdminUser(formData: FormData) {
  const current = await getAdminUser();
  if (!current || current.role !== "owner") redirect("/admin");
  const id = String(formData.get("id") || "");
  const data = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "editor"),
  };
  if (id) {
    await prisma.adminUser.update({ where: { id }, data });
  } else {
    await prisma.adminUser.create({ data });
  }
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteAdminUser(formData: FormData) {
  const current = await getAdminUser();
  if (!current || current.role !== "owner") redirect("/admin");
  const id = String(formData.get("id"));
  if (id !== current.id) {
    await prisma.adminUser.delete({ where: { id } });
  }
  revalidatePath("/admin/users");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status") ?? "new") },
  });
  revalidatePath("/admin/orders");
}

export async function saveDriver(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? "").replace(/\D/g, ""),
    password: String(formData.get("password") ?? ""),
  };
  if (!data.name || !data.phone || !data.password) redirect("/admin/drivers");
  if (id) {
    await prisma.driver.update({ where: { id }, data });
  } else {
    await prisma.driver.create({ data });
  }
  revalidatePath("/admin/drivers");
  redirect("/admin/drivers");
}

export async function deleteDriver(formData: FormData) {
  await requireAdmin();
  await prisma.driver.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/drivers");
}

export async function assignDriver(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const driverId = String(formData.get("driverId") ?? "");
  await prisma.order.update({
    where: { id: orderId },
    data: {
      driverId: driverId || null,
      ...(driverId ? { status: "delivering" } : {}),
    },
  });
  revalidatePath("/admin/orders");
}

export async function addWalletBalance(formData: FormData) {
  await requireAdmin();
  const customerId = String(formData.get("customerId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim();
  if (!customerId || !Number.isFinite(amount) || amount <= 0) return;
  await prisma.$transaction([
    prisma.customer.update({
      where: { id: customerId },
      data: { walletBalance: { increment: amount } },
    }),
    prisma.walletTransaction.create({
      data: {
        customerId,
        amount,
        type: "admin_topup",
        note: note || "شحن من الإدارة",
      },
    }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath("/account");
}

export async function refundOrderItem(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "wallet");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!orderId || !Number.isFinite(amount) || amount <= 0) return;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.customerId) return;

  if (method === "wallet") {
    await prisma.$transaction([
      prisma.customer.update({
        where: { id: order.customerId },
        data: { walletBalance: { increment: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          customerId: order.customerId,
          orderId,
          amount,
          type: "refund_wallet",
          note: reason || "مرتجع صنف غير متوفر",
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { refundAmount: amount, refundMethod: "wallet", refundStatus: "completed" },
      }),
    ]);
  } else {
    const releaseAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.walletTransaction.create({
        data: {
          customerId: order.customerId,
          orderId,
          amount,
          type: "refund_bank",
          status: "pending",
          releaseAt,
          note: reason || "مرتجع لحساب بنكي (خلال 72 ساعة)",
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { refundAmount: amount, refundMethod: "bank", refundStatus: "pending" },
      }),
    ]);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/refunds");
  revalidatePath("/account");
}

export async function completeBankRefund(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.walletTransaction.updateMany({
    where: { id, type: "refund_bank", status: "pending" },
    data: { status: "completed" },
  });
  revalidatePath("/admin/refunds");
}
