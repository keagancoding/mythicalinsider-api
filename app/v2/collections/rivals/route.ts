import { NextResponse } from "next/server";

export async function GET () {
  const data = await fetch("https://api.github.com/users/vercel/repos")
}