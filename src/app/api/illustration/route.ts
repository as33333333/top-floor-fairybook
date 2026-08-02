import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

type IllustrationRequest = {
  story?: string;
  selectedWords?: string[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as IllustrationRequest;
  const story = body.story?.trim();
  const selectedWords = body.selectedWords || [];

  if (!story) {
    return json({ error: "Missing story" }, { status: 400 });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  const prompt = buildIllustrationPrompt(story, selectedWords);

  if (!apiKey) {
    return json({
      image: null,
      prompt,
      fallback: true
    });
  }

  const baseUrl = (process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/api/v1").replace(
    /\/$/,
    ""
  );
  const response = await fetch(`${baseUrl}/services/aigc/text2image/image-synthesis`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable"
    },
    body: JSON.stringify({
      model: process.env.DASHSCOPE_IMAGE_MODEL || "wanx2.1-t2i-turbo",
      input: {
        prompt,
        negative_prompt: "文字，水印，真实照片，恐怖，肢体畸形，过度饱和，明显AI感"
      },
      parameters: {
        size: "1024*1024",
        n: 1,
        prompt_extend: false,
        watermark: false
      }
    })
  });

  if (!response.ok) {
    return json({ error: "Image task creation failed" }, { status: response.status });
  }

  const task = (await response.json()) as DashScopeTaskResponse;
  const taskId = task.output?.task_id;

  if (!taskId) {
    return json({ error: "Image task ID missing" }, { status: 502 });
  }

  for (let attempt = 0; attempt < 24; attempt += 1) {
    await delay(attempt === 0 ? 3000 : 5000);

    const resultResponse = await fetch(`${baseUrl}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store"
    });

    if (!resultResponse.ok) {
      return json({ error: "Image task query failed" }, { status: resultResponse.status });
    }

    const result = (await resultResponse.json()) as DashScopeTaskResponse;
    const status = result.output?.task_status;

    if (status === "SUCCEEDED") {
      const image = result.output?.results?.find((item) => item.url)?.url || null;
      return json({ image, taskId });
    }

    if (["FAILED", "CANCELED", "UNKNOWN"].includes(status || "")) {
      return json(
        { error: result.output?.message || "Image generation failed", taskId },
        { status: 502 }
      );
    }
  }

  return json({ error: "Image generation timed out", taskId }, { status: 504 });
}

type DashScopeTaskResponse = {
  output?: {
    task_id?: string;
    task_status?: string;
    message?: string;
    results?: Array<{ url?: string }>;
  };
};

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function buildIllustrationPrompt(story: string, selectedWords: string[]) {
  return [
    "儿童绘本风，蜡笔质感，纸张纹理，温柔安静，低饱和。",
    "为网页叙事游戏《给我讲个故事》生成一张童话书内页插图。",
    `故事：${story}`,
    `需要包含或呼应的词语：${selectedWords.join("、")}`,
    "完整绘制主要角色和关键物件，主体位于画面中央，四周保留约 10% 的安全留白，所有重要内容都在画幅内，不要裁切。",
    "不要文字，不要真实照片，不要恐怖，不要明显性别化角色。"
  ].join("\n");
}
