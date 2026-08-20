import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/auth";

export async function GET() {
  const customer = await getCustomer();
  return NextResponse.json({
    loggedIn: Boolean(customer),
    name: customer?.name ?? null,
    phone: customer?.phone ?? null,
    walletBalance: customer?.walletBalance ?? 0,
    addresses:
      customer?.addresses.map((address) => ({
        id: address.id,
        label: address.label,
        area: address.area,
        street: address.street,
        building: address.building,
        lat: address.lat,
        lng: address.lng,
        isDefault: address.isDefault,
      })) ?? [],
  });
}
