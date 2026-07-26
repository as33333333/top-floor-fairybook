"use client";

import { useEffect, useMemo, useState } from "react";
import { floors } from "@/data/floors";
import { drawCardsForFloor, validateStory } from "@/lib/cards";
import { buildFallbackPortrait } from "@/lib/portrait";
import type { CardCategory, FloorDraft, GameScreen, Portrait, WordCard } from "@/types/game";

const categoryLabels: Record<CardCategory, string> = {
  symbol: "意象词",
  emotion: "情绪词",
  action: "行动词"
};

const storageKey = "top-floor-fairybook-session";

const backgroundByFloor: Record<number, string> = {
  1: "/art_assets/01_backgrounds/bg_stair_1f.png",
  2: "/art_assets/01_backgrounds/bg_stair_2f.png",
  3: "/art_assets/01_backgrounds/bg_stair_3f.png",
  4: "/art_assets/01_backgrounds/bg_stair_4f.png",
  5: "/art_assets/01_backgrounds/bg_stair_5f.png"
};

const startBackground =
  "linear-gradient(90deg, rgba(255,247,230,0.94), rgba(255,247,230,0.76)), url('/art_assets/01_backgrounds/bg_start_tower.png')";

const bookCoverBackground =
  "linear-gradient(90deg, rgba(181,138,98,0.12), transparent 36px), linear-gradient(rgba(255,253,244,0.82), rgba(255,253,244,0.82)), url('/art_assets/05_book/book_cover.png')";

const bookPageBackground =
  "linear-gradient(90deg, rgba(181,138,98,0.12), transparent 36px), linear-gradient(rgba(255,253,244,0.88), rgba(255,253,244,0.88)), url('/art_assets/05_book/book_page_template.png')";

type StoredGame = {
  screen: GameScreen;
  currentFloor: number;
  drafts: FloorDraft[];
};

export default function Home() {
  const [screen, setScreen] = useState<GameScreen>("start");
  const [currentFloor, setCurrentFloor] = useState(1);
  const [drafts, setDrafts] = useState<FloorDraft[]>([]);
  const [drawnCards, setDrawnCards] = useState<WordCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<CardCategory, string>>({
    symbol: "",
    emotion: "",
    action: ""
  });
  const [story, setStory] = useState("");
  const [error, setError] = useState("");
  const [bookPage, setBookPage] = useState(0);
  const [portrait, setPortrait] = useState<Portrait | null>(null);
  const [portraitLoading, setPortraitLoading] = useState(false);

  const floor = floors.find((item) => item.floor === currentFloor) || floors[0];
  const selectedWords = useMemo(
    () =>
      (Object.values(selectedIds)
        .map((id) => drawnCards.find((card) => card.id === id)?.word)
        .filter(Boolean) as string[]),
    [drawnCards, selectedIds]
  );

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const stored = JSON.parse(raw) as StoredGame;
      setScreen(stored.screen || "start");
      setCurrentFloor(stored.currentFloor || 1);
      setDrafts(stored.drafts || []);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ screen, currentFloor, drafts }));
  }, [screen, currentFloor, drafts]);

  useEffect(() => {
    if (screen !== "floor") return;
    setDrawnCards(drawCardsForFloor(currentFloor, drafts));
    setSelectedIds({ symbol: "", emotion: "", action: "" });
    setStory("");
    setError("");
  }, [screen, currentFloor, drafts]);

  const selectCard = (card: WordCard) => {
    setSelectedIds((prev) => ({ ...prev, [card.category]: card.id }));
    setError("");
  };

  const submitStory = () => {
    const message = validateStory(selectedWords, story);
    if (message) {
      setError(message);
      return;
    }

    setDrafts((prev) => [
      ...prev.filter((draft) => draft.floor !== currentFloor),
      {
        floor: currentFloor,
        selectedWords,
        selectedIds: Object.values(selectedIds),
        userStory: story.trim(),
        timestamp: Date.now()
      }
    ]);
    setScreen("response");
  };

  const goNext = () => {
    if (currentFloor >= 5) {
      setScreen("book");
      setBookPage(0);
      return;
    }

    setCurrentFloor((value) => value + 1);
    setScreen("floor");
  };

  const resetGame = () => {
    window.localStorage.removeItem(storageKey);
    setScreen("start");
    setCurrentFloor(1);
    setDrafts([]);
    setDrawnCards([]);
    setSelectedIds({ symbol: "", emotion: "", action: "" });
    setStory("");
    setBookPage(0);
    setPortrait(null);
  };

  const createPortrait = async () => {
    setPortraitLoading(true);
    try {
      const response = await fetch("/api/portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameData: drafts })
      });
      const data = (await response.json()) as Portrait;
      setPortrait(data);
    } catch {
      setPortrait(buildFallbackPortrait(drafts));
    } finally {
      setPortraitLoading(false);
      setScreen("portrait");
    }
  };

  return (
    <main className="app-shell">
      <div className="stair-illustration" aria-hidden="true">
        <span className="window-glow" />
        <span className="stair stair-one" />
        <span className="stair stair-two" />
        <span className="stair stair-three" />
        <span className="paper-plane" />
      </div>

      {screen === "start" && (
        <section
          className="hero screen-panel art-backed start-art"
          style={{ backgroundImage: startBackground }}
        >
          <p className="eyebrow">疗愈型网页叙事游戏</p>
          <h1>给我讲个故事</h1>
          <p className="hero-copy">
            有个朋友住在顶楼。ta 不太常说话，但总会留下几张词卡作为线索。
            今天，你要一层一层走上去，把故事讲给 ta 听。
          </p>
          <div className="button-row">
            <button className="primary-button" onClick={() => setScreen("intro")}>
              开始上楼
            </button>
            {drafts.length > 0 && (
              <button className="ghost-button" onClick={() => setScreen("floor")}>
                继续故事
              </button>
            )}
          </div>
        </section>
      )}

      {screen === "intro" && (
        <section className="screen-panel intro">
          <p className="eyebrow">秘密游戏</p>
          <h2>朋友会在每一层留下词卡线索。</h2>
          <p>
            你要选出 3 个词，继续讲一个故事。如果朋友听见了，楼梯间会发生一点点变化。
          </p>
          <p>不用写得很好。像小时候那样讲就可以。</p>
          <button className="primary-button" onClick={() => setScreen("floor")}>
            去第一层
          </button>
        </section>
      )}

      {screen === "floor" && (
        <section className="game-layout">
          <aside
            className="floor-scene art-backed"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(255,247,230,0.9), rgba(255,247,230,0.78)), url('${backgroundByFloor[floor.floor]}')`
            }}
          >
            <div className="floor-badge">{floor.floor}F</div>
            <h2>{floor.title}</h2>
            <p>{floor.prompt}</p>
            <small>{floor.helper}</small>
            <div className={`friend-cue cue-${floor.floor}`} />
          </aside>

          <section className="writing-panel" aria-label="楼层写作">
            <div className="stage-line">
              <span>{floor.stage}</span>
              <span>{drafts.length}/5 页</span>
            </div>
            <div className="card-groups">
              {(["symbol", "emotion", "action"] as CardCategory[]).map((category) => (
                <div className="word-group" key={category}>
                  <h3>{categoryLabels[category]}</h3>
                  <div className="word-grid">
                    {drawnCards
                      .filter((card) => card.category === category)
                      .map((card) => (
                        <button
                          key={card.id}
                          className={`word-card ${selectedIds[category] === card.id ? "selected" : ""}`}
                          onClick={() => selectCard(card)}
                        >
                          {card.word}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="selected-line">
              {selectedWords.length > 0 ? selectedWords.join(" / ") : "先从每类词卡里各选一张"}
            </div>
            <textarea
              value={story}
              onChange={(event) => setStory(event.target.value)}
              placeholder="把这 3 个词放进故事里，讲给顶楼的朋友听。"
              rows={7}
            />
            {error && <p className="error-text">{error}</p>}
            <button className="primary-button submit-button" onClick={submitStory}>
              讲给朋友听
            </button>
          </section>
        </section>
      )}

      {screen === "response" && (
        <section className="screen-panel response-panel">
          <p className="eyebrow">朋友的回应</p>
          <h2>{floor.response.change}</h2>
          <blockquote>“{floor.response.line}”</blockquote>
          <button className="primary-button" onClick={goNext}>
            {currentFloor >= 5 ? "装订童话书" : "继续上楼"}
          </button>
        </section>
      )}

      {screen === "book" && (
        <section className="book-layout">
          <div
            className="book-page art-backed"
            style={
              bookPage === 0
                ? { backgroundImage: bookCoverBackground }
                : { backgroundImage: bookPageBackground }
            }
          >
            {bookPage === 0 ? (
              <>
                <p className="eyebrow">一本刚装订好的书</p>
                <h2>《给我讲个故事》</h2>
                <p>这些故事被轻轻夹进纸页里，送给顶楼的朋友。</p>
              </>
            ) : (
              <StoryPage draft={drafts[bookPage - 1]} />
            )}
          </div>
          <div className="book-controls">
            <button className="ghost-button" disabled={bookPage === 0} onClick={() => setBookPage((value) => value - 1)}>
              上一页
            </button>
            <span>{bookPage + 1} / 6</span>
            <button
              className="ghost-button"
              disabled={bookPage === 5}
              onClick={() => setBookPage((value) => value + 1)}
            >
              下一页
            </button>
          </div>
          <button className="primary-button" onClick={createPortrait} disabled={portraitLoading}>
            {portraitLoading ? "朋友正在读故事..." : "查看我的故事画像"}
          </button>
        </section>
      )}

      {screen === "portrait" && portrait && (
        <section className="portrait-layout">
          <p className="eyebrow">你的童话画像</p>
          <h2>{portrait.portraitName}</h2>
          <div className="symbol-list">
            {portrait.mainSymbols.map((symbol) => (
              <span key={symbol}>{symbol}</span>
            ))}
          </div>
          <p>{portrait.emotionalTone}</p>
          <p>{portrait.relationshipPattern}</p>
          <p>{portrait.agencyPattern}</p>
          <p>{portrait.safetyAndNeed}</p>
          <blockquote>{portrait.fairyTaleSummary}</blockquote>
          <strong>{portrait.finalMessage}</strong>
          <div className="button-row">
            <button className="primary-button" onClick={resetGame}>
              重新开始
            </button>
            <button className="ghost-button" onClick={() => setScreen("book")}>
              回看童话书
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function StoryPage({ draft }: { draft?: FloorDraft }) {
  if (!draft) return null;

  return (
    <>
      <p className="eyebrow">第 {draft.floor} 页</p>
      <h2>{draft.selectedWords.join(" / ")}</h2>
      <p>{draft.userStory}</p>
    </>
  );
}
