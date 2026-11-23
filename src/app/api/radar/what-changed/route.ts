import { NextRequest, NextResponse } from "next/server";
import { whatChangedEngine } from "@/lib/radar/what-changed-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") || "10");

    const events = whatChangedEngine.getRecentRadarEvents(limit);

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch radar events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch radar events" },
      { status: 500 }
    );
  }
}
