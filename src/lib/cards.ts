import { wordCards } from "@/data/wordCards";
import type { CardCategory, FloorDraft, TagScores, WordCard } from "@/types/game";

const categories: CardCategory[] = ["symbol", "emotion", "action"];
const looseChars = new Set(["的", "地", "得", "了", "着", "过", "在", "一", "个", "只", "很", "被"]);

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, "").replace(/[，。！？、,.!?;；:："'“”‘’（）()[\]《》<>]/g, "");
}

function coreChars(text: string) {
  const chars = Array.from(normalizeText(text)).filter((char) => !looseChars.has(char));
  return Array.from(new Set(chars));
}

function hasCharsInOrder(chars: string[], story: string) {
  let cursor = 0;

  return chars.every((char) => {
    const index = story.indexOf(char, cursor);
    if (index === -1) return false;
    cursor = index + 1;
    return true;
  });
}

function wordAppearsLoosely(word: string, story: string) {
  const normalizedWord = normalizeText(word);
  const normalizedStory = normalizeText(story);

  if (normalizedStory.includes(normalizedWord)) return true;

  const chars = coreChars(normalizedWord);
  if (chars.length === 0) return true;

  const hasEveryCoreChar = chars.every((char) => normalizedStory.includes(char));

  return hasEveryCoreChar || hasCharsInOrder(chars, normalizedStory);
}

export function drawCardsForFloor(floor: number, drafts: FloorDraft[]) {
  const usedIds = new Set(drafts.flatMap((draft) => draft.selectedIds));
  const previousSymbols = drafts
    .flatMap((draft) => draft.selectedWords)
    .filter((word) => word.length <= 6);

  return categories.flatMap((category) => {
    const candidates = wordCards.filter(
      (card) => card.floor === floor && card.category === category && !usedIds.has(card.id)
    );
    const picked = shuffle(candidates).slice(0, 3);

    if (floor === 5 && category === "symbol" && previousSymbols.length > 0) {
      const memoryCard: WordCard = {
        id: `memory-${previousSymbols[0]}`,
        word: previousSymbols[0],
        category: "symbol",
        floor: 5,
        tags: { memory: 2, being_seen: 1 }
      };
      return shuffle([memoryCard, ...picked]).slice(0, 3);
    }

    return picked;
  });
}

export function validateStory(selectedWords: string[], story: string) {
  if (selectedWords.length !== 3) {
    return "每一类词卡都选一张，再讲给朋友听。";
  }

  if (story.trim().length < 20) {
    return "可以再多讲一点点，不用完美，像小时候那样讲就好。";
  }

  const missing = selectedWords.filter((word) => !wordAppearsLoosely(word, story));
  if (missing.length > 0) {
    return `好像还有词卡没有被讲进故事里：${missing.join("、")}。`;
  }

  return "";
}

export function collectTagScores(drafts: FloorDraft[]) {
  return drafts.reduce<TagScores>((scores, draft) => {
    draft.selectedIds.forEach((id) => {
      const source =
        wordCards.find((card) => card.id === id) ||
        wordCards.find((card) => card.word === id.replace("memory-", ""));

      if (!source) return;
      Object.entries(source.tags).forEach(([tag, value]) => {
        scores[tag] = (scores[tag] || 0) + value;
      });
    });

    return scores;
  }, {});
}

export function topTags(scores: TagScores) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}
