import { getStravaTokens, saveStravaTokens, clearStravaTokens } from "./db";
import { estimateRunCalories } from "./calc";
import type { Run } from "./types";

const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities";

export function isStravaConfigured(): boolean {
  return !!process.env.STRAVA_CLIENT_ID && !!process.env.STRAVA_CLIENT_SECRET;
}

function redirectUri(): string {
  return process.env.STRAVA_REDIRECT_URI || "http://localhost:3000/api/strava/callback";
}

export function getStravaAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || "",
    redirect_uri: redirectUri(),
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });
  return `${STRAVA_AUTHORIZE_URL}?${params.toString()}`;
}

type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number; firstname?: string; lastname?: string };
};

export async function exchangeCodeForToken(code: string): Promise<void> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as StravaTokenResponse;
  await saveStravaTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athleteId: data.athlete?.id ?? null,
    athleteName: data.athlete ? `${data.athlete.firstname ?? ""} ${data.athlete.lastname ?? ""}`.trim() : null,
  });
}

async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as StravaTokenResponse;
}

export async function isStravaConnected(): Promise<boolean> {
  return !!(await getStravaTokens());
}

export async function stravaAthleteName(): Promise<string | null> {
  const tokens = await getStravaTokens();
  return tokens?.athleteName ?? null;
}

export async function disconnectStrava(): Promise<void> {
  await clearStravaTokens();
}

async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStravaTokens();
  if (!tokens) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  if (tokens.expiresAt > nowSec + 60) {
    return tokens.accessToken;
  }

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  await saveStravaTokens({
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    expiresAt: refreshed.expires_at,
    athleteId: tokens.athleteId,
    athleteName: tokens.athleteName,
  });
  return refreshed.access_token;
}

type StravaSummaryActivity = {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  type?: string;
  sport_type?: string;
  start_date_local: string;
};

function mapActivity(a: StravaSummaryActivity): Run {
  const distanceKm = Math.round((a.distance / 1000) * 10) / 10;
  const durationMin = Math.round(a.moving_time / 60);
  return {
    id: "strava-" + a.id,
    date: a.start_date_local.slice(0, 10),
    distanceKm,
    durationMin,
    source: "strava",
  };
}

// Fetches recent runs from Strava. Returns null if not connected or the
// request fails, so callers can fall back to mock data. Strava's activity
// list doesn't reliably include calories, so calorie estimates are derived
// the same way as the mock data (distanceKm * 62), matching the original
// prototype's "~calories" convention.
export async function fetchStravaRuns(limit = 10): Promise<Run[] | null> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return null;

    const params = new URLSearchParams({ per_page: String(limit * 3) });
    const res = await fetch(`${STRAVA_ACTIVITIES_URL}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Strava API error", res.status, await res.text());
      return null;
    }
    const activities = (await res.json()) as StravaSummaryActivity[];
    return activities
      .filter((a) => (a.sport_type || a.type) === "Run")
      .slice(0, limit)
      .map(mapActivity);
  } catch (err) {
    console.error("Strava API request failed", err);
    return null;
  }
}

export function runCalories(distanceKm: number): number {
  return estimateRunCalories(distanceKm);
}
