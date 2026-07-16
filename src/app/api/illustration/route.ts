import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type IllustrationRequest = {
  story?: string;
  selectedWords?: string[];
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as IllustrationRequest;
  const story = body.story?.trim();
  const selectedWords = body.selectedWords || [];

  if (!story) {
    return NextResponse.json({ error: "Missing story" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      image: null,
      prompt: buildIllustrationPrompt(story, selectedWords),
      fallback: true
    });
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt: buildIllustrationPrompt(story, selectedWords),
      size: "1024x1024"
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Image generation failed" }, { status: response.status });
  }

  const data = await response.json();
  const image = data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null;

  return NextResponse.json({ image });
}

function buildIllustrationPrompt(story: string, selectedWords: string[]) {
  return [
    "儿童绘本风，蜡笔质感，纸张纹理，温柔安静，低饱和。",
    "为网页叙事游戏《顶楼的童话书》生成一张童话书内页插图。",
    `故事：${story}`,
    `需要包含或呼应的词语：${selectedWords.join("、")}`,
    "不要文字，不要真实照片，不要恐怖，不要明显性别化角色。"
  ].join("\n");
}
