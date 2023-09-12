import { NextResponse } from "next/server";
import collection from "@/data/nitro.json";

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  const item = collection.collections.find(
    (item: any) => item.address === address
  );

  if (!item) {
    return NextResponse.json("Error fetching collection", { status: 500 });
  }

  return NextResponse.json({ data: item });
}
