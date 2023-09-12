import { collectionsSearchSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import collection from "@/data/rivals.json";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedValues = collectionsSearchSchema.parse(
    Object.fromEntries(searchParams)
  );
  const { page = 0, limit = 12, query } = parsedValues;
  const collectionData = collection.collections.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );
  const pageStart = page * limit;
  const pageEnd = pageStart + limit;
  const collections = collectionData.slice(pageStart, pageEnd);
  const page_summary = {
    page_item_count: collections.length,
    page: page,
    limit: limit,
    max_items: collectionData.length,
    total_pages: Math.ceil(collectionData.length / limit),
  };

  if (!collections) {
    return NextResponse.json("Error fetching collections", { status: 500 });
  }

  return NextResponse.json({ data: collections, page_summary });
}
