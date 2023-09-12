import { collectionsUpdateSchema } from "@/lib/validations";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { env } from "process";

async function getItemTypes(page: number, limit: number) {
  const itemTypesReq = await fetch("https://graphql.mythical.market/graphql", {
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.6",
      authorization: "",
      "content-type": "application/json",
      "mythical-environment-id": "hcihi.p.535",
    },
    referrer: "https://blankos.mythical.market/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `{"query":"\\n  query GetCollections(\\n    $filter: SearchFilterInput\\n    $asks: AskFilterInput\\n    $items: SearchFilterInput\\n    $sort: ItemTypeSortInput!\\n    $page: PageOptionsInput!\\n  ) {\\n    item_types(\\n      filter: $filter\\n      asks: $asks\\n      items: $items\\n      sort: $sort\\n      page: $page\\n    ) {\\n      returning {\\n        ...ItemTypeView\\n      }\\n      page_summary {\\n        page_item_count: num_in_page\\n        page: page_num\\n        limit: page_size\\n        max_items: total_num\\n        total_pages: total_pages\\n      }\\n    }\\n  }\\n  \\n  fragment ItemTypeView on ItemType {\\n    game_item_type_id\\n    display_name\\n    description\\n    item_class\\n    img_thumb_url\\n    img_large_url\\n    metadata\\n    total_minted\\n    total_burned\\n    max_supply\\n    min_price_usd\\n    withdrawable\\n  }\\n\\n","variables":{"filter":{},"page":{"page_num":${page},"page_size":${limit}},"sort":{"option":"DISPLAY_NAME","order":"ASC"}}}`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  const itemTypes = await itemTypesReq.json().catch((e) => {
    return null;
  });

  const item_types = itemTypes.data.item_types.returning
    ? itemTypes.data.item_types.returning
    : null;

  const refactorItemTypes = item_types
    ? item_types.map((item: any) => {
        return {
          collection_id: item.game_item_type_id,
          name: item.display_name,
          description: item.description,
          class: item.item_class,
          data: {
            season: item.metadata.season_display_name,
            last_drop: item.metadata.recent_drop_start,
            total_minted: item.total_minted,
            total_burned: item.total_burned,
            max_supply: item.max_supply,
            floor: parseFloat(item.min_price_usd).toFixed(2),
            withdrawable: item.withdrawable,
          },
          media: {
            thumbnail: item.img_thumb_url,
            front: item.metadata.properties.item_images.Front,
            left: item.metadata.properties.item_images.Left,
            right: item.metadata.properties.item_images.Right,
          },
        };
      })
    : null;

  const page_summary = itemTypes.data.item_types.page_summary || null;

  if (!refactorItemTypes || !page_summary) {
    return null;
  }

  return { collections: refactorItemTypes };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedValues = collectionsUpdateSchema.parse(
    Object.fromEntries(searchParams)
  );
  const { secret } = parsedValues;

  if (secret !== env.UPDATE_SECRET) {
    return NextResponse.json("Error", { status: 401 });
  }

  const collections = await getItemTypes(0, 500);

  const file = await fs.open("./data/collections.json", "w");
  await file.write(JSON.stringify(collections));
  await file.close();

  if (!collections) {
    return NextResponse.json("Error fetching collections", { status: 500 });
  }

  return NextResponse.json("Success", { status: 200 });
}
