import { NextResponse } from "next/server";
import { isHevyConfigured } from "@/lib/hevy";
import { isStravaConfigured, isStravaConnected, stravaAthleteName } from "@/lib/strava";
import type { IntegrationStatus } from "@/lib/types";

export async function GET() {
  const status: IntegrationStatus = {
    hevy: { configured: isHevyConfigured() },
    strava: {
      configured: isStravaConfigured(),
      connected: await isStravaConnected(),
      athleteName: (await stravaAthleteName()) ?? undefined,
    },
  };
  return NextResponse.json(status);
}
