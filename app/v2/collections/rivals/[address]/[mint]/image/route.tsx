/* eslint-disable @next/next/no-img-element */
import { type ServerRuntime } from "next";
import { NextResponse, ImageResponse } from "next/server";

export const runtime: ServerRuntime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { address: string; mint: string } }
) {
  const { address, mint } = params;
  try {
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

    const inter = await fetch(
      "https://api.mythicalinsider.com/fonts/Inter-Regular.ttf"
    ).then((res) => res.arrayBuffer());
    const interBold = await fetch(
      "https://api.mythicalinsider.com/fonts/Inter-Bold.ttf"
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div tw="flex relative w-full h-full bg-red-400">
          <img
            src={data.image}
            alt=""
            width={400}
            height={400}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(4)",
              filter: "blur(10px) brightness(0.75)",
            }}
          />
          <div tw="flex flex-col justify-end items-center w-full h-full opacity-20">
            <span
              tw="text-white text-[50px] font-bold"
              style={{ display: "block", lineClamp: 1,  }}
            >{`#${mint} ${data.name}`}</span>
          </div>
          <img
            src={data.image}
            alt=""
            width={375}
            height={375}
            style={{
              borderRadius: "10px",
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 30px 5px rgba(0, 0, 0, 0.8)",
            }}
          />
        </div>
      ),
      {
        width: 500,
        height: 500,
        fonts: [
          {
            name: "Inter",
            data: inter,
            weight: 400,
            style: "normal",
          },
          {
            name: "Inter",
            data: interBold,
            weight: 700,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json("Error fetching item", { status: 500 });
  }
}
