"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setCustomerSession, clearCustomerSession } from "@/lib/auth";

export async function customerLogin(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) redirect("/account?error=login");

  const rawPhone = identifier.replace(/\D/g, "");
  const withCountry = rawPhone.startsWith("20")
    ? rawPhone
    : rawPhone.startsWith("0")
      ? `20${rawPhone.slice(1)}`
      : rawPhone
        ? `20${rawPhone}`
        : "";
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { phone: identifier },
        ...(rawPhone ? [{ phone: rawPhone }] : []),
        ...(withCountry ? [{ phone: withCountry }] : []),
        { email: identifier.toLowerCase() },
      ],
    },
  });
  if (!customer || !customer.password || customer.password !== password) {
    redirect("/account?error=login");
  }
  await setCustomerSession(customer.id);
  redirect("/account");
}

export async function customerRegister(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  let phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  if (phone.startsWith("20")) phone = phone.slice(2);
  if (phone.startsWith("0")) phone = phone.slice(1);
  phone = `20${phone}`;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || phone.length < 10 || password.length < 4) {
    redirect("/account?error=register");
  }
  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    if (existing.password) redirect("/account?error=exists");
    await prisma.customer.update({
      where: { id: existing.id },
      data: { name, password, email: email || null },
    });
    await setCustomerSession(existing.id);
    redirect("/account");
  }
  const customer = await prisma.customer.create({
    data: { name, phone, password, email: email || null },
  });
  await setCustomerSession(customer.id);
  redirect("/account");
}

export async function customerLogout() {
  await clearCustomerSession();
  redirect("/");
}

export async function saveAddress(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) redirect("/account");
  const existingCount = await prisma.address.count({ where: { customerId } });
  const isDefault = formData.get("isDefault") === "on" || existingCount === 0;
  const labels = new Set(["المنزل", "العمل", "الاستراحة", "منزل صديق", "أخرى"]);
  const incomingLabel = String(formData.get("label") ?? "المنزل");
  const label = labels.has(incomingLabel) ? incomingLabel : "أخرى";
  if (isDefault) {
    await prisma.address.updateMany({ where: { customerId }, data: { isDefault: false } });
  }
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  await prisma.address.create({
    data: {
      customerId,
      label,
      area: String(formData.get("area") ?? "فاقوس"),
      street: String(formData.get("street") ?? ""),
      building: String(formData.get("building") ?? ""),
      buildingImage: String(formData.get("buildingImage") ?? "") || null,
      lat: Number.isFinite(lat) && lat !== 0 ? lat : null,
      lng: Number.isFinite(lng) && lng !== 0 ? lng : null,
      isDefault,
    },
  });
  redirect("/account");
}

export async function deleteAddress(formData: FormData) {
  await prisma.address.delete({ where: { id: String(formData.get("id")) } });
  redirect("/account");
}

export async function setDefaultAddress(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!customerId || !id) redirect("/account");
  await prisma.$transaction([
    prisma.address.updateMany({ where: { customerId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  redirect("/account?tab=profile");
}
