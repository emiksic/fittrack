import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const MealEstimateSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI estimation is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description) {
    return NextResponse.json({ error: "Missing description." }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system:
        "You estimate nutrition facts for a described meal or food portion. Give your best realistic estimate for the exact quantities described, using typical nutrition values for the foods mentioned. Respond with a short, human-readable meal name in the same language as the input, and the total calories, protein, carbs, and fat in grams for the whole described portion.",
      messages: [{ role: "user", content: description }],
      output_config: { format: zodOutputFormat(MealEstimateSchema) },
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse AI response." }, { status: 502 });
    }

    return NextResponse.json({
      name: parsed.name,
      calories: Math.max(0, Math.round(parsed.calories)),
      protein: Math.max(0, Math.round(parsed.protein)),
      carbs: Math.max(0, Math.round(parsed.carbs)),
      fat: Math.max(0, Math.round(parsed.fat)),
    });
  } catch (err) {
    console.error("Meal estimate failed", err);
    return NextResponse.json({ error: "AI estimation failed." }, { status: 502 });
  }
}
