import { NextRequest, NextResponse } from "next/server";
import { pulseVisionEngine } from "@/lib/vision/pulse-vision-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageA, imageB, assetSymbol } = body;

    if (!imageA || !imageB) {
      return NextResponse.json(
        { success: false, error: "Both imageA and imageB base64 screenshots are required for Pulse Compare" },
        { status: 400 }
      );
    }

    const compareResult = await pulseVisionEngine.compareScreenshots(
      imageA,
      imageB,
      assetSymbol || "XAU/USD"
    );

    return NextResponse.json({
      success: true,
      data: compareResult,
    });
  } catch (error: any) {
    console.error("Pulse Compare failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute Pulse Compare" },
      { status: 500 }
    );
  }
}
