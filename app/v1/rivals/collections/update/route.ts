import { collectionsUpdateSchema } from "@/lib/validations";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { env } from "process";

const getData = async () => {
  const req = await fetch(
    "https://explorer.mythical.market/api/nfts?size=500",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.5",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
      },
      method: "GET",
    }
  );

  const { data } = await req.json();
  if (!data) {
    return null;
  }

  return data;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedValues = collectionsUpdateSchema.parse(
    Object.fromEntries(searchParams)
  );
  const { secret } = parsedValues;

  if (secret !== env.UPDATE_SECRET) {
    return NextResponse.json("Error", { status: 401 });
  }

  const data = await getData();
  const collections = data.filter((item: any) => item.name.includes("."));

  const collectionsWithMetadata = await Promise.all(
    collections.map(async (item: any) => {
      if (item.totalSupply > 0) {
        const req = await fetch(
          `https://metadata.mythicalgames.com/${item.address}/1`
        );

        if (req.ok) {
          const data = await req.json();
          if (data) {
            return {
              address: item.address,
              name: data.name,
              description: data.description,
              image: data.image,
              total_supply: item.totalSupply,
              transaction_count: item.transactionCount,
              holders_count: item.holdersCount,
            };
          }
        }
      }
    })
  );

  const file = await fs.open("./data/rivals.json", "w");
  await file.write(
    JSON.stringify({
      collections: collectionsWithMetadata.filter((item: any) => item),
    })
  );
  await file.close();

  if (!collections) {
    return NextResponse.json("Error fetching collections", { status: 500 });
  }

  return NextResponse.json("Success", { status: 200 });
}
