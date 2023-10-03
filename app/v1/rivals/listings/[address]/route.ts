import { pageLimitSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

// export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const { searchParams } = new URL(req.url);
  const parsedValues = pageLimitSchema.parse(Object.fromEntries(searchParams));
  const { page = 0 } = parsedValues;
  const { address } = params;
  const events = await fetch(
    `https://explorer.mythical.market/api/contracts/${address}/events?page=${page}&size=100&direction=DESC&sort=timestampISO`
  );
  const contract = await fetch(
    `https://explorer.mythical.market/api/contracts/${address}`
  );

  if (!events.ok || !contract.ok) {
    return NextResponse.json("Error fetching listings", { status: 500 });
  }

  const { data } = await events.json();
  const { data: contractData } = await contract.json();
  console.log(contractData);
  // const filterdEvents = data.filter((event: any) => {
  //   if (event.eventName === "OrderCreated") {
  //     if (
  //       event.parameters.find((e: any) => e.name === "orderType").value === "1"
  //     ) {
  //       return event;
  //     }
  //   }
  // });

  // const listings = filterdEvents.map((event: any) => {
  //   const flattenedParams = event.parameters.reduce(
  //     (acc: any, cur: any) => ({ ...acc, [cur.name]: cur.value }),
  //     {}
  //   );

  //   return {
  //     txn: event.transactionHash,
  //     to: event.to,
  //     from: event.from,
  //     address: event.address,
  //     time_stamp_iso: event.timestampISO,
  //     event_name: event.eventName,
  //     event_type: "listing",
  //     nft_id: flattenedParams.tokenId,
  //     creator: flattenedParams.creator.replace("0x00", "0x"),
  //     wei_price: parseInt(flattenedParams.priceInWei),
  //     myth_price: parseInt(flattenedParams.priceInWei) / 1000000000000000000,
  //   };
  // });

  return NextResponse.json({ listings: data });
}
