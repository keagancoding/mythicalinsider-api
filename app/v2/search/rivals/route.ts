import { collectionsSearchSchema } from "@/lib/validations";
import collectionData from "@/data/rivals.json";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedValues = collectionsSearchSchema.parse(
    Object.fromEntries(searchParams)
  );
  const {
    query,
    name,
    rarity,
    categroy,
    program,
    page = 0,
    limit = 12,
  } = parsedValues;
  const offset = page * limit;

  let results = collectionData.collections;

  if (query) {
    results = results.filter(
      (collection) =>
        collection.name.toLowerCase().includes(query.toLowerCase()) ||
        collection.address.toLowerCase().includes(query.toLowerCase()) ||
        collection.attributes.program
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        collection.attributes.rarity
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        collection.attributes.category
          .toLowerCase()
          .includes(query.toLowerCase())
    );
  }

  if (name) {
    results = results.filter((collection) =>
      collection.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (rarity) {
    results = results.filter((collection) =>
      collection.attributes.rarity.toLowerCase().includes(rarity.toLowerCase())
    );
  }

  if (program) {
    results = results.filter((collection) =>
      collection.attributes.program
        .toLowerCase()
        .includes(program.toLowerCase())
    );
  }

  if (categroy) {
    results = results.filter((collection) =>
      collection.attributes.category
        .toLowerCase()
        .includes(categroy.toLowerCase())
    );
  }

  const paginatedResults = results.slice(offset, offset + limit);
  const page_summary = {
    page_item_count: paginatedResults.length,
    page: page,
    limit: limit,
    max_items: results.length,
    total_pages: Math.ceil(results.length / limit),
  };

  if (!results) {
    return NextResponse.json("Error fetching collections", { status: 500 });
  }

  return NextResponse.json({ data: paginatedResults, page_summary });
}
