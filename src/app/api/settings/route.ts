import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";
import type { Settings } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as Partial<Settings>;
  const settings = await updateSettings(body);
  return NextResponse.json({ settings });
}
