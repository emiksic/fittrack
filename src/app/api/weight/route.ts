import { NextRequest, NextResponse } from "next/server";
import { listWeightLog, upsertWeightEntry } from "@/lib/db";
import type { WeightEntry } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ weightLog: await listWeightLog() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as WeightEntry;
  if (!body.date || !body.weightKg) {
    return NextResponse.json({ error: "Missing date or weightKg" }, { status: 400 });
  }
  await upsertWeightEntry(body);
  return NextResponse.json({ weightLog: await listWeightLog() });
}
