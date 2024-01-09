import { pageLimitSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  const { searchParams } = new URL(req.url);
  const parsedValues = pageLimitSchema.parse(Object.fromEntries(searchParams));
  const { page = 0, limit = 12 } = parsedValues;

  const collection = await fetch(
    `https://explorer.mythical.market/api/nfts/${address}/collections?size=${limit}&page=${page}`
  ).then((res) => res.json());

  if (!collection) {
    return NextResponse.json("Error fetching collection", { status: 500 });
  }

  return NextResponse.json({ data: collection });
}
