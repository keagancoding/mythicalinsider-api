import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { address: string; mint: string } }
) {
  const { address, mint } = params;

  const request = await fetch(
    `https://metadata.mythicalgames.com/${address}/${mint}`
  );

  if (!request.ok) {
    return NextResponse.json("Error fetching collection", { status: 500 });
  }

  const data = await request.json();

  if (!data) {
    return NextResponse.json("Error fetching collection", { status: 500 });
  }

  return NextResponse.json({
    data: {
      ...data,
      address,
      mint,
      mythical_insider_image: `https://metadata.mythicalgames.com/${address}/${mint}/image`,
    },
  });
}
