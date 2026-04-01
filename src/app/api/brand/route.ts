import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ success: false, message: "URL parameter required" }, { status: 400 });
  }

  const apiKey = process.env.OPENBRAND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://openbrand.sh/api/extract?url=${encodeURIComponent(url)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch brand data" },
      { status: 500 }
    );
  }
}