import { NextRequest, NextResponse } from "next/server";
import type { FloorDraft, Portrait } from "@/types/game";
import { buildFallbackPortrait, portraitPrompt } from "@/lib/portrait";

export const runtime = "nodejs";

type ResponseContent = {
  text?: string;
};

type ResponseOutput = {
  content?: ResponseContent[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: ResponseOutput[];
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { gameData?: FloorDraft[] };
  const gameData = body.gameData || [];

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(buildFallbackPortrait(gameData));
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: portraitPrompt(gameData),
        text: {
          format: {
            type: "json_object"
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const result = (await response.json()) as OpenAIResponse;
    const raw =
      result.output_text ||
      result.output?.flatMap((item) => item.content || [])?.find((item) => item.text)?.text;

    if (!raw) {
      throw new Error("OpenAI response did not include text");
    }

    const portrait = JSON.parse(raw) as Portrait;
    return NextResponse.json(portrait);
  } catch {
    return NextResponse.json(buildFallbackPortrait(gameData));
  }
}
