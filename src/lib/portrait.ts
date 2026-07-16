import type { FloorDraft, Portrait } from "@/types/game";
import { collectTagScores, topTags } from "@/lib/cards";

const namesByTag: Record<string, string> = {
  safety: "点灯的人",
  boundary: "给门留缝的人",
  protection: "撑伞的人",
  connection_need: "慢慢靠近的人",
  being_seen: "收藏星星的人",
  agency: "带着小灯出发的人",
  adventure: "追风的人",
  repair: "修补的人",
  imagination: "造梦的人",
  avoidance: "藏进树洞的人",
  patience: "等雨停的人",
  home: "回家的人",
  freedom: "把风放进口袋的人",
  sadness: "听雨的人",
  hope: "点亮窗户的人",
  trust: "把故事递出去的人"
};

export function buildFallbackPortrait(drafts: FloorDraft[]): Portrait {
  const scores = collectTagScores(drafts);
  const tags = topTags(scores);
  const words = Array.from(new Set(drafts.flatMap((draft) => draft.selectedWords))).slice(0, 5);
  const mainTag = tags[0] || "imagination";
  const hasRepair = tags.includes("repair");
  const hasSafety = tags.includes("safety") || tags.includes("protection");
  const hasConnection = tags.includes("connection_need") || tags.includes("being_seen");
  const hasAdventure = tags.includes("adventure") || tags.includes("freedom");

  return {
    portraitName: namesByTag[mainTag] || "把故事递出去的人",
    mainSymbols: words,
    emotionalTone: hasSafety
      ? "你的故事带着安静的安全感，像是在雨声里慢慢把灯点亮。"
      : "你的故事有柔软的起伏，明亮和不确定都被放进了同一本童话书里。",
    relationshipPattern: hasConnection
      ? "你笔下的靠近通常不是突然闯入，而是通过等待、倾听、分享和小小的回应慢慢发生。"
      : "你笔下的角色更习惯先观察世界，再决定要不要把心里的话递出去。",
    agencyPattern: hasAdventure
      ? "故事里的角色愿意出发、寻找、打开新的可能，即使有一点犹豫，也还是在向前走。"
      : "故事里的角色不急着证明勇敢，更像是在确认自己准备好了以后，再做一个小小选择。",
    safetyAndNeed: hasSafety
      ? "灯、门、雨伞、毛毯这类意象让故事显得很在意边界与保护，也许你很珍惜不被催促的陪伴。"
      : "这些意象让故事像一张慢慢展开的纸，里面有想被听见、也想保留一点安静角落的需要。",
    fairyTaleSummary: hasRepair
      ? "这不像一个关于胜利的故事，更像一个关于修好、靠近和继续讲下去的故事。"
      : "这次童话留下的痕迹，是一个小孩把看见的东西认真收好，再轻轻交给朋友。",
    finalMessage: "你不用一下子把故事讲完。有人愿意听见你慢慢说到这里。"
  };
}

export function portraitPrompt(gameData: FloorDraft[]) {
  return `你是一个擅长叙事心理分析和儿童绘本解读的 AI。
请基于玩家在游戏中选择的词语和写下的故事，生成一份“故事心理画像”。

重要限制：
1. 不做心理诊断。
2. 不使用疾病、创伤、人格障碍等医学化表达。
3. 不评分，不排名，不评价好坏。
4. 不要过度夸奖，也不要武断下结论。
5. 画像要尽量真实、温柔、细腻。
6. 请基于玩家实际文本，不要编造不存在的内容。
7. 可以使用“似乎”“也许”“你的故事里呈现出”等柔性表达。

请输出 JSON，字段为：
portraitName, mainSymbols, emotionalTone, relationshipPattern, agencyPattern, safetyAndNeed, fairyTaleSummary, finalMessage

玩家数据：
${JSON.stringify(gameData, null, 2)}`;
}
