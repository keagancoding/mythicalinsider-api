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
    `https://explorer.mythical.market/api/nfts/${address}/collections?limit=1`
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
      rarity: metadata.attributes.find(
        (attr: { traitType: string }) => attr.traitType === "Rarity"
      ).value,
      program: metadata.attributes.find(
        (attr: { traitType: string }) => attr.traitType === "Program"
      ).value,
      position: metadata.attributes.find(
        (attr: { traitType: string }) => attr.traitType === "Position"
      ).value,
      variant: metadata.attributes.find(
        (attr: { traitType: string }) => attr.traitType === "Variant"
      ).value,
      category: metadata.attributes.find(
        (attr: { traitType: string }) => attr.traitType === "Category"
      ).value,
    },
  };

  return NextResponse.json({ data });
}
