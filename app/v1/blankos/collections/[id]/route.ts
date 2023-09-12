import { NextResponse } from "next/server";
import collection from "@/data/collections.json";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const item = collection.collections.find((item) => item.collection_id === id);

  if (!item) {
    return NextResponse.json("Error fetching item", { status: 500 });
  }

  return NextResponse.json({ item });
}
