/* eslint-disable @next/next/no-img-element */
import { type ServerRuntime } from "next";
import { NextResponse, ImageResponse } from "next/server";

export const runtime: ServerRuntime = "edge";

async function getItemById(id: string) {
  const itemIdReq = await fetch("https://graphql.mythical.market/graphql", {
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.6",
      "content-type": "application/json",
      "mythical-environment-id": "hcihi.p.535",
    },
    referrer: "https://api.mythicalinsider.com",
    method: "POST",
    body: `{"query":"\\n  query GetItem($game_inventory_id: String!) {\\n    item: item(gameInventoryId: $game_inventory_id) {\\n      ...ItemView\\n    }\\n  }\\n  \\n  fragment ItemView on Item {\\n    game_inventory_id\\n    game_item_type_id\\n    dgood_id\\n    dgood_serial\\n    owned_pending_asks: asks(\\n      filter: {\\n        player_ask: true\\n        status: { operator: IN, value: [PENDING_CONFIRMED] }\\n      }\\n      page: { page_num: 0, page_size: 10 }\\n    ) {\\n      returning {\\n        id\\n        price\\n        currency\\n        status\\n      }\\n    }\\n    asks: asks(\\n      filter: { status: { operator: IN, value: [CONFIRMED] } }\\n      page: { page_num: 0, page_size: 10 }\\n    ) {\\n      returning {\\n        id\\n        price\\n        currency\\n        status\\n      }\\n    }\\n    metadata\\n    status\\n    cooldown_timestamp\\n    item_type {\\n      game_item_type_id\\n      item_class\\n      display_name\\n      description\\n      total_minted\\n      total_burned\\n      max_supply\\n      img_large_url\\n      img_thumb_url\\n      metadata\\n      withdrawable\\n    min_price_usd\\n    }\\n  }\\n\\n","variables":{"game_inventory_id":"${id}"}}`,
  });

  const item_data = await itemIdReq.json().catch((e) => {
    return null;
  });

  const item = item_data.data?.item ?? null;

  if (!item) {
    return null;
  }

  return item;
}

export async function GET(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const item = await getItemById(itemId);
    const item_img =
      item.metadata.properties?.images?.front ??
      item.item_type.metadata.properties?.item_images?.FrontBoxed ??
      item.metadata.image;

    if (!item) {
      throw new Error("Item not found");
    }

    const inter = await fetch(
      "https://api.mythicalinsider.com/fonts/Inter-Regular.ttf",
      {
        headers: {
          referrer: "https://api.mythicalinsider.com",
          referrerPolicy: "strict-origin-when-cross-origin",
          mode: "cors",
        },
      }
    ).then((res) => res.arrayBuffer());
    const interBold = await fetch(
      "https://api.mythicalinsider.com/fonts/Inter-Bold.ttf",
      {
        headers: {
          referrer: "https://api.mythicalinsider.com",
          referrerPolicy: "strict-origin-when-cross-origin",
          mode: "cors",
        },
      }
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div tw="flex relative w-full h-full bg-red-400">
          <img
            src={item_img}
            alt=""
            width={400}
            height={400}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(4)",
              filter: "blur(10px) brightness(0.75)",
            }}
          />
          <div tw="flex flex-col justify-between w-full h-full opacity-20">
            <div tw="flex flex-col p-5">
              <span
                tw="text-white text-[55px]"
                style={{ display: "block", lineClamp: 1 }}
              >
                {item.metadata.name}
              </span>
              <span
                tw="text-white text-[18px]"
                style={{ display: "block", lineClamp: 3 }}
              >
                {item.metadata.description}
              </span>
            </div>
            <span tw="text-white text-[100px]">#{item.dgood_serial}</span>
          </div>
          <img
            src={item_img}
            alt=""
            width={455}
            height={455}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              filter: "brightness(0) blur(10px)",
            }}
          />
          <img
            src={item_img}
            alt=""
            width={450}
            height={450}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      ),
      {
        width: 500,
        height: 500,
        fonts: [
          {
            name: "Inter",
            data: inter,
            weight: 400,
            style: "normal",
          },
          {
            name: "Inter",
            data: interBold,
            weight: 700,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json("Error fetching item", { status: 500 });
  }
}
