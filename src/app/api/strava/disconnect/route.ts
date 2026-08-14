import { NextResponse } from "next/server";
import { disconnectStrava } from "@/lib/strava";

export async function POST() {
  await disconnectStrava();
  return NextResponse.json({ ok: true });
}
