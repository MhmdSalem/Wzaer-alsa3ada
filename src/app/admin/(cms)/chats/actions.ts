"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function sendAdminReply(formData: FormData) {
  await requireAdmin();
  const ticketId = String(formData.get("ticketId") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 1000);
  if (!ticketId || !body) redirect("/admin/chats");
  await prisma.supportMessage.create({
    data: { ticketId, body, fromAdmin: true, readByAdmin: true },
  });
  await prisma.supportMessage.updateMany({
    where: { ticketId, fromAdmin: false, readByAdmin: false },
    data: { readByAdmin: true },
  });
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });
  revalidatePath("/admin/chats");
  redirect(`/admin/chats?t=${ticketId}`);
}

export async function closeTicket(formData: FormData) {
  await requireAdmin();
  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) redirect("/admin/chats");
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "closed",
      closedAt: new Date(),
    },
  });
  revalidatePath("/admin/chats");
  redirect(`/admin/chats?t=${ticketId}`);
}

export async function reopenTicket(formData: FormData) {
  await requireAdmin();
  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) redirect("/admin/chats");
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "open",
      closedAt: null,
      rating: null,
      ratingComment: null,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/admin/chats");
  redirect(`/admin/chats?t=${ticketId}`);
}
