import { NextResponse } from "next/server";

async function getItemById(id: string) {
  const itemIdReq = await fetch("https://graphql.mythical.market/graphql", {
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.6",
      "content-type": "application/json",
      "mythical-environment-id": "hcihi.p.535",
    },
    body: `{"query":"\\n  query GetItem($game_inventory_id: String!) {\\n    item: item(gameInventoryId: $game_inventory_id) {\\n      ...ItemView\\n    }\\n  }\\n  \\n  fragment ItemView on Item {\\n    game_inventory_id\\n    game_item_type_id\\n    dgood_id\\n    dgood_serial\\n    owned_pending_asks: asks(\\n      filter: {\\n        player_ask: true\\n        status: { operator: IN, value: [PENDING_CONFIRMED] }\\n      }\\n      page: { page_num: 0, page_size: 10 }\\n    ) {\\n      returning {\\n        id\\n        price\\n        currency\\n        status\\n      }\\n    }\\n    asks: asks(\\n      filter: { status: { operator: IN, value: [CONFIRMED] } }\\n      page: { page_num: 0, page_size: 10 }\\n    ) {\\n      returning {\\n        id\\n        price\\n        currency\\n        status\\n      }\\n    }\\n    metadata\\n    status\\n    cooldown_timestamp\\n    item_type {\\n      game_item_type_id\\n      item_class\\n      display_name\\n      description\\n      total_minted\\n      total_burned\\n      max_supply\\n      img_large_url\\n      img_thumb_url\\n      metadata\\n      withdrawable\\n    min_price_usd\\n    }\\n  }\\n\\n","variables":{"game_inventory_id":"${id}"}}`,
    method: "POST",
  });

  const item_data = await itemIdReq.json().catch((e) => {
    return null;
  });

  const item = item_data.data?.item ?? null;

  if (!item) {
    return null;
  }

  let item_img =
    item.metadata.properties?.images?.front ??
    item.item_type.metadata.properties?.item_images?.FrontBoxed ??
    item.metadata.image;

  const formattedItem = {
    name: item.item_type.display_name,
    mint: item.dgood_serial,
    item_id: item.game_inventory_id,
    collection_id: item.game_item_type_id,
    status: item.status,
    total_minted: item.item_type.total_minted,
    total_burned: item.item_type.total_burned,
    max_supply: item.item_type.max_supply,
    image: item_img,
    description: item.metadata.description,
    item_class: item.item_type.item_class,
    floor: parseFloat(item.item_type.min_price_usd).toFixed(2),
    withdrawable: item.item_type.withdrawable,
    drop_price: item.item_type.metadata.properties.base_price_usd,
    last_drop: item.item_type.metadata.properties.recent_drop_start,
    artist: item.item_type.metadata.properties.artist_display_name,
    season: item.item_type.metadata.properties.season_display_name,
    media: {
      mythicalinsider_image_card: encodeURI(
        `https://api.mythicalinsider.com/v1/blankos/items/${item.game_inventory_id}/image/card`
      ),
      mythicalinsider_image: encodeURI(
        `https://api.mythicalinsider.com/v1/blankos/items/${item.game_inventory_id}/image`
      ),
      ...(item.metadata.properties?.images?.front
        ? {
            front: item.metadata.properties?.images.front,
          }
        : {
            front: item.item_type.metadata.properties.item_images.Front,
          }),
      ...(item.item_type.metadata.properties.item_images?.FrontBoxed && {
        front_boxed: item.item_type.metadata.properties.item_images.FrontBoxed,
      }),
      ...(item.metadata.properties?.images?.right
        ? {
            right: item.metadata.properties?.images.right,
          }
        : {
            right: item.item_type.metadata.properties.item_images.Right,
          }),
      ...(item.item_type.metadata.properties.item_images?.RightBoxed && {
        right_boxed: item.item_type.metadata.properties.item_images.RightBoxed,
      }),
      ...(item.metadata.properties?.images?.left
        ? {
            left: item.metadata.properties?.images.left,
          }
        : { left: item.item_type.metadata.properties.item_images.Left }),
      ...(item.item_type.metadata.properties.item_images?.LeftBoxed && {
        left_boxed: item.item_type.metadata.properties.item_images?.LeftBoxed,
      }),
      ...(item.item_type.metadata.properties?.artist_image_url && {
        artist: item.item_type.metadata.properties.artist_image_url,
      }),
      ...(item.item_type.metadata.properties?.animations?.Boxed && {
        boxed_animation: item.item_type.metadata.properties.animations?.Boxed,
      }),
      ...(item.item_type.metadata.properties.animations?.Unboxed && {
        unboxed_animation:
          item.item_type.metadata.properties.animations?.Unboxed,
      }),
    },
    data: {
      ...(item.metadata.properties.boxed && {
        boxed: item.metadata.properties.boxed,
      }),
      ...(item.metadata.properties?.grade && {
        grade: item.metadata.properties?.grade,
      }),
      ...(item.metadata.properties?.level && {
        level: item.metadata.properties?.level,
      }),
      ...(item.metadata.properties?.isBlended && {
        blended: item.metadata.properties?.isBlended,
      }),
      ...(item.metadata.properties?.blendedCount && {
        blended_count: item.metadata.properties?.blendedCount,
      }),
      ...(item.metadata.properties?.hiddenSkills && {
        hidden_skills: item.metadata.properties?.hiddenSkills,
      }),
      ...(item.metadata.properties?.class && {
        class: item.metadata.properties?.class,
      }),
      ...(item.item_type.metadata.properties?.item_class && {
        item_subclass: item.item_type.metadata.properties.item_class,
      }),
      ...(item.item_type.metadata.properties?.collection && {
        collection: item.item_type.metadata.properties.collection,
      }),
    },
    asks: item.asks.returning ?? [],
  };

  console.log(formattedItem);

  return { ...formattedItem };
}

export async function GET(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  const { itemId } = params;

  const item = await getItemById(itemId);

  if (!item) {
    return NextResponse.json("Error fetching item", { status: 500 });
  }

  return NextResponse.json(item);
}
