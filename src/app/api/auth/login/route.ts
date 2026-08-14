import { NextRequest, NextResponse } from "next/server";
import { computeSessionToken, constantTimeEqual, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    return NextResponse.json({ error: "App password not configured." }, { status: 500 });
  }

  const { password } = await request.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !constantTimeEqual(password, appPassword)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await computeSessionToken(appPassword);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
