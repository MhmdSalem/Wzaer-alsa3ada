import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const customer = await getCustomer();
  if (!customer) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }
  const body = (await request.json()) as {
    addressId?: string;
    payment: string;
    fulfillment?: string;
    paymentProof?: string;
    note?: string;
    items: unknown;
    subtotal?: number;
    deliveryFee?: number;
    walletUsed?: number;
    total: number;
  };
  const fulfillment = body.fulfillment === "pickup" ? "pickup" : "delivery";
  const selectedAddress = fulfillment === "delivery"
    ? customer.addresses.find((address) => address.id === String(body.addressId ?? ""))
      ?? customer.addresses.find((address) => address.isDefault)
      ?? customer.addresses[0]
    : undefined;
  if (fulfillment === "delivery" && !selectedAddress) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }
  const walletUsed = Math.max(0, Number(body.walletUsed ?? 0));
  const subtotal = Number(body.subtotal ?? body.total ?? 0);
  const deliveryFee = Number(body.deliveryFee ?? 0);
  const total = Number(body.total ?? subtotal + deliveryFee);
  if (!Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "invalid total" }, { status: 400 });
  }
  if (walletUsed > 0 && customer.walletBalance < walletUsed) {
    return NextResponse.json({ error: "insufficient wallet" }, { status: 400 });
  }
  const walletPayment = (body.payment === "vodafone" || body.payment === "instapay") && total > 0;
  const effectivePayment = total === 0 && walletUsed > 0 ? "wallet" : body.payment;
  const id = `W${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        id,
        customerId: customer.id,
        customerName: customer.name,
        phone: customer.phone,
        address: fulfillment === "pickup"
          ? "استلام من الماركت"
          : `${selectedAddress?.label} · ${selectedAddress?.area} · ${selectedAddress?.street} ${selectedAddress?.building}`.trim(),
        lat: selectedAddress?.lat ?? null,
        lng: selectedAddress?.lng ?? null,
        payment: effectivePayment,
        fulfillment,
        paymentProof: body.paymentProof || null,
        note: body.note ?? "",
        subtotal,
        deliveryFee,
        walletUsed,
        total,
        items: JSON.stringify(body.items),
        status: walletPayment ? "payment_review" : "new",
        deliveryCode: String(Math.floor(1000 + Math.random() * 9000)),
      },
    });
    if (walletUsed > 0) {
      await tx.customer.update({
        where: { id: customer.id },
        data: { walletBalance: { decrement: walletUsed } },
      });
      await tx.walletTransaction.create({
        data: {
          customerId: customer.id,
          orderId: id,
          amount: -walletUsed,
          type: "order_payment",
          note: `خصم من محفظة العميل للطلب ${id}`,
        },
      });
    }
  });
  return NextResponse.json({ id });
}
