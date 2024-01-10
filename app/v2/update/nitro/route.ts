import { collectionsUpdateSchema } from "@/lib/validations";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { env } from "process";

interface Notify {
  log: (message: string) => void;
  complete: (data: any) => void;
  error: (error: Error | any) => void;
  close: () => void;
}
interface Item {
  address: string;
  addressLinks: {
    href: string;
    rel: string;
    display: string;
  }[];
  name: string;
  symbol: string;
  totalSupply: number;
  contractType: string;
  transactionCount: number;
  lastExecutedTimestampISO: string;
}

const getData = async (notify: Notify) => {
  notify.log("Fetching Nitros\n");
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

  const collectionsWithMetadata = [];
  const errors = [];
  for (let i = 0; i < collections.length; i++) {
    const item = collections[i];

    const progress = Math.round((i / collections.length) * 100);
    const bar = `[${"█".repeat(progress / 4).padEnd(25, " ")}]`;

    notify.log(`${bar} ${i + 1}/${collections.length} - ${item.name}\n`);

    if (item.totalSupply > 0) {
      const req = await fetch(
        `https://explorer.mythical.market/api/nfts/${item.address}/collections?limit=1`
      );

      if (req.ok) {
        const data = await req.json();
        const metadata = data.data[0];
        if (data) {
          collectionsWithMetadata.push({
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
          });
        }
      } else {
        notify.error(
          `Error fetching metadata for ${item.name} - ${item.address}`
        );
        errors.push(`${item.name} - ${item.address}`);
      }
    }
  }

  const file = await fs.open("./data/nitro.json", "w");
  await file.write(
    JSON.stringify({
      collections: collectionsWithMetadata.filter((item: any) => item),
    })
  );
  await file.close();
  notify.log("Successfully Updated Nitro");
  notify.complete(`With ${errors.length} errors \n ${errors.join("\n")}`);
};

const getMetadata = async (items: Item[], notify: Notify) => {};

export async function GET(req: Request, res: Response) {
  const { searchParams } = new URL(req.url);
  const parsedValues = collectionsUpdateSchema.parse(
    Object.fromEntries(searchParams)
  );
  const { secret } = parsedValues;

  if (secret !== env.UPDATE_SECRET) {
    return NextResponse.json("Error", { status: 401 });
  }

  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  let closed = false;
  const encoder = new TextEncoder();

  getData({
    log: (message) => {
      writer.write(encoder.encode(message));
    },
    complete: (data) => {
      writer.write(encoder.encode(data));
      writer.close();
      closed = true;
    },
    error: (error) => {
      writer.write(encoder.encode(error));
      writer.close();
      closed = true;
    },
    close: () => {
      writer.close();
      closed = true;
    },
  });

  // return NextResponse.json("Success", { status: 200 });
  return new Response(responseStream.readable, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/event-stream; charset=utf-8",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "none",
    },
  });
}
