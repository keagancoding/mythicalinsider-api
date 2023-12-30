import { pageLimitSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

// export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const { searchParams } = new URL(req.url);
  const parsedValues = pageLimitSchema.parse(Object.fromEntries(searchParams));
  const { page = 0, limit = 5, sortby = "timestampISO" } = parsedValues;
  const { address } = params;
  const events = await fetch(
    `https://explorer.mythical.market/api/contracts/${address}/events?page=${page}&size=${limit}&filter=(%20eventName%20eq%20Transfer%20)`
  );

  if (!events.ok) {
    return NextResponse.json("Error fetching listings", { status: 500 });
  }

  const { data } = await events.json();
  const filterdEvents = data.filter((event: any) => {
    if (event.to !== "0xed52047a29a47764a06563fa4c84aee51c253eaf") {
      return {
        txn: event.transactionHash,
        to: event.to,
        from: event.from,
      };
    }
  });
  console.log(filterdEvents);

  const txnData = await Promise.all(
    filterdEvents.map(async (event: any) => {
      const txn = await fetch(
        `https://explorer.mythical.market/api/transactions/${event.transactionHash}/events`
      );
      const {data} = await txn.json();
      return data;
    })
  );

  const filteredTxnData = txnData.filter((event: any) => {
    if (event.eventName === "OrderCreated") {
      return event;
    }
  });
  console.log(filteredTxnData);

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

  return NextResponse.json({ listings: filterdEvents });
}
