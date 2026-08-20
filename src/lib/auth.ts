import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

const ADMIN_COOKIE = "wazir-admin";
const CUSTOMER_COOKIE = "wazir-customer";
const DRIVER_COOKIE = "wazir-driver";

export async function getAdminUser() {
  const jar = await cookies();
  const id = jar.get(ADMIN_COOKIE)?.value;
  if (!id) return null;
  return prisma.adminUser.findUnique({ where: { id } });
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function setAdminSession(id: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function getCustomer() {
  const jar = await cookies();
  const id = jar.get(CUSTOMER_COOKIE)?.value;
  if (!id) return null;
  return prisma.customer.findUnique({
    where: { id },
    include: { addresses: { orderBy: { isDefault: "desc" } } },
  });
}

export async function setCustomerSession(id: string) {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90 });
}

export async function clearCustomerSession() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function getDriver() {
  const jar = await cookies();
  const id = jar.get(DRIVER_COOKIE)?.value;
  if (!id) return null;
  return prisma.driver.findUnique({ where: { id } });
}

export async function requireDriver() {
  const driver = await getDriver();
  if (!driver) redirect("/driver/login");
  return driver;
}

export async function setDriverSession(id: string) {
  const jar = await cookies();
  jar.set(DRIVER_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
}

export async function clearDriverSession() {
  const jar = await cookies();
  jar.delete(DRIVER_COOKIE);
}
