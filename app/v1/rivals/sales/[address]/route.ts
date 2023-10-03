import { pageLimitSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const { searchParams } = new URL(req.url);
  const parsedValues = pageLimitSchema.parse(Object.fromEntries(searchParams));
  const { page = 0 } = parsedValues;
  const { address } = params;
  const request = await fetch(
    `https://explorer.mythical.market/api/contracts/${address}/events?page=${page}&size=100&direction=DESC&sort=timestampISO`
  );

  if (!request.ok) {
    return NextResponse.json("Error fetching listings", { status: 500 });
  }

  const { data } = await request.json();
  const filterdEvents = data.filter((event: any) => {
    if (event.eventName === "OrderExecuted") {
      return event;
    }
  });

  return NextResponse.json({ sales: filterdEvents });
}
