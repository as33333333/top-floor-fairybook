export type CardCategory = "symbol" | "emotion" | "action";

export type TagScores = Record<string, number>;

export type WordCard = {
  id: string;
  word: string;
  category: CardCategory;
  floor: number;
  tone?: "bright" | "vulnerable" | "complex";
  tags: TagScores;
};

export type FloorConfig = {
  floor: number;
  stage: string;
  title: string;
  prompt: string;
  helper: string;
  response: {
    change: string;
    line: string;
  };
};

export type FloorDraft = {
  floor: number;
  selectedWords: string[];
  selectedIds: string[];
  userStory: string;
  timestamp: number;
};

export type Portrait = {
  portraitName: string;
  mainSymbols: string[];
  emotionalTone: string;
  relationshipPattern: string;
  agencyPattern: string;
  safetyAndNeed: string;
  fairyTaleSummary: string;
  finalMessage: string;
};

export type GameScreen =
  | "start"
  | "intro"
  | "floor"
  | "response"
  | "book"
  | "portrait";
