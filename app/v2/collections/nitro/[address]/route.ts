import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  const nft = await fetch(
    `https://explorer.mythical.market/api/nfts/${address}`
  ).then((res) => res.json());

  const collection = await fetch(
    `https://explorer.mythical.market/api/nfts/${address}/collections`
  ).then((res) => res.json());

  if (!nft || !collection) {
    return NextResponse.json("Error fetching collection", { status: 500 });
  }

  const metadata = collection.data[0];

  const data = {
    address: nft.address,
    name: nft.name,
    description: metadata.collectionDescription,
    image: nft.image,
    total_supply: nft.totalSupply,
    transaction_count: nft.transactionCount,
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

  return NextResponse.json({ data });
}
