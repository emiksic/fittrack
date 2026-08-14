import { NextRequest, NextResponse } from "next/server";
import { listMeals, insertMeal, deleteMeal } from "@/lib/db";
import { todayISO, pad2 } from "@/lib/calc";
import type { NewMealInput } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ meals: await listMeals() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as NewMealInput;
  const name = (body.name || "").trim();
  const calories = Number(body.calories) || 0;
  if (!name || !calories) {
    return NextResponse.json({ error: "Enter a name and calories." }, { status: 400 });
  }
  const now = new Date();
  const meal = {
    id: "m" + Date.now(),
    date: todayISO(),
    time: pad2(now.getHours()) + ":" + pad2(now.getMinutes()),
    name,
    calories,
    protein: Number(body.protein) || 0,
    carbs: Number(body.carbs) || 0,
    fat: Number(body.fat) || 0,
  };
  await insertMeal(meal);
  return NextResponse.json({ meal }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteMeal(id);
  return NextResponse.json({ ok: true });
}
