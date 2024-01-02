import { collectionsUpdateSchema } from "@/lib/validations";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { env } from "process";

const getData = async () => {
  const req = await fetch(
    "https://explorer.mythical.market/api/nfts?size=6000",
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
  // console.log(data)
  // filter out collections that don't have a period in the name
  const collections = data.filter((item: any) => {
    if (item.name) {
      if (!item.name.includes(".")) {
        if (
          item.name !== "Test ItemType Prod 1 (TEST1)" &&
          item.name !== "DMarketAssets (DMA)"
        ) {
          return item;
        }
      }
    }
  });

  const collectionsWithMetadata = await Promise.all(
    collections.map(async (item: any) => {
      if (item.totalSupply > 0) {
        const req = await fetch(
          `https://explorer.mythical.market/api/nfts/${item.address}/collections?limit=1`
        );

        if (req.ok) {
          const data = await req.json();
          const metadata = data.data[0];
          if (data) {
            return {
              address: item.address,
              name: item.name,
              description: metadata.collectionDescription,
              image: metadata.image,
              total_supply: item.totalSupply,
              transaction_count: item.transactionCount,
              attributes: {
                category:
                  metadata.attributes?.find(
                    (attr: { traitType: string }) =>
                      attr.traitType.toLowerCase() === "category"
                  )?.value ?? "",
                edition:
                  metadata.attributes?.find(
                    (attr: { traitType: string }) =>
                      attr.traitType.toLowerCase() === "edition" ||
                      attr.traitType === "Edition"
                  )?.value ?? "",
                tier:
                  metadata.attributes?.find(
                    (attr: { traitType: string }) => attr.traitType === "tier"
                  )?.value ?? "",
                star_rarity:
                  metadata.attributes?.find(
                    (attr: { traitType: string }) =>
                      attr.traitType.toLowerCase() === "starrarity"
                  )?.value ?? "",
                rarity:
                  metadata.attributes?.find(
                    (attr: { traitType: string }) =>
                      attr.traitType.toLowerCase() === "rarity"
                  )?.value ?? "",
              },
            };
          }
        }
      }
    })
  );

  const file = await fs.open("./data/nitro.json", "w");
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

// https://gs-assets.mythical.dev/AdminAssets/nflrivals/8/Saquon_Barkley.mp4
// https://imgproxy.mythical.market/insecure/rs:fill:500:500:1/g:ce/plain/https://gs-assets.mythical.dev/AdminAssets/nflrivals/10/Penei_Sewell.png@jpg
// https://imgproxy.mythical.market/insecure/rs:fill:500:500:1/g:ce/plain/https://gs-assets.mythical.dev/AdminAssets/nflrivals/11/Deshaun_Watson.png@jpg
// https://imgproxy.mythical.market/insecure/rs:fill:500:500:1/g:ce/plain/https://gs-assets.mythical.dev/AdminAssets/nflrivals/7/Stephon_Gilmore.png@jpg
