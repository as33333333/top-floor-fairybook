(function () {
  const app = document.querySelector("#app");
  const storageKey = "top-floor-fairybook-static-session";
  const categories = ["symbol", "emotion", "action"];
  const categoryLabels = {
    symbol: "意象词",
    emotion: "情绪词",
    action: "行动词"
  };
  const assetBase = window.location.protocol === "file:" ? "../public/art_assets" : "./art_assets";
  const looseChars = new Set(["的", "地", "得", "了", "着", "过", "在", "一", "个", "只", "很", "被"]);
  const propByFloor = {
    1: "prop_blue_sticker.png",
    2: "prop_little_lamp.png",
    3: "prop_paper_boat.png",
    4: "prop_glowing_plant.png",
    5: "prop_star_sticker.png"
  };

  const floors = [
    {
      floor: 1,
      stage: "开始",
      title: "故事开始了",
      prompt: "朋友把几张词卡放在第一层的门口。请选择 3 个词，作为故事的开头。",
      helper: "故事里可以出现一个小角色，ta 准备去某个地方，或者发现了一件奇怪的小事。",
      cue: "贴纸",
      response: {
        change: "门缝里飘出一张蓝色贴纸，楼梯墙上出现一行很浅的蜡笔字。",
        line: "后来呢？"
      }
    },
    {
      floor: 2,
      stage: "遇见",
      title: "故事遇见了谁",
      prompt: "朋友轻轻敲了敲墙。好像想知道，后来遇见了什么？",
      helper: "请继续上一层的故事，让故事里出现一次遇见。",
      cue: "小灯",
      response: {
        change: "楼梯墙上的一盏小灯亮起，墙角多了一颗小星星贴纸。",
        line: "我还想听。"
      }
    },
    {
      floor: 3,
      stage: "困难",
      title: "故事遇到困难",
      prompt: "楼梯间下起了很小很小的雨。朋友把新的词卡放在台阶上。",
      helper: "让故事中出现一个困难、不舒服、害怕、孤单或暂时不知道怎么办的时刻。",
      cue: "纸船",
      response: {
        change: "雨声变小了，地上出现一只小纸船。",
        line: "这里是不是有一点难过？"
      }
    },
    {
      floor: 4,
      stage: "转折",
      title: "故事开始转弯",
      prompt: "朋友把一架纸飞机飞了回来。纸飞机上写着：如果故事还没有结束，它会怎么变好？",
      helper: "请继续故事，让角色做一个小小的选择。",
      cue: "发光植物",
      response: {
        change: "墙角长出一株发光植物，楼梯扶手上多了新的蜡笔线条。",
        line: "原来故事可以这样转弯。"
      }
    },
    {
      floor: 5,
      stage: "结尾",
      title: "送给朋友的结尾",
      prompt: "顶楼的门后很安静。朋友把最后几张词卡放在门口。",
      helper: "把前面出现过的角色、物品、情绪和选择串起来，写成最后一页童话。",
      cue: "门开了",
      response: {
        change: "顶楼窗户亮起，门慢慢打开。朋友伸出手，接过童话书。",
        line: "我一直都在听。"
      }
    }
  ];

  const wordCards = [
    card("f1-blue-door", "蓝色门", "symbol", 1, { boundary: 2, safety: 1 }),
    card("f1-kite", "风筝", "symbol", 1, { freedom: 2, adventure: 1 }),
    card("f1-marble", "玻璃珠", "symbol", 1, { imagination: 2, being_seen: 1 }),
    card("f1-bag", "小书包", "symbol", 1, { agency: 1, home: 1 }),
    card("f1-grass", "草地", "symbol", 1, { hope: 2, freedom: 1 }),
    card("f1-puddle", "水洼", "symbol", 1, { uncertainty: 1, imagination: 1 }),
    card("f1-curious", "好奇", "emotion", 1, { adventure: 2, imagination: 1 }),
    card("f1-nervous", "紧张", "emotion", 1, { caution: 2, vulnerability: 1 }),
    card("f1-expect", "期待", "emotion", 1, { hope: 2, connection_need: 1 }),
    card("f1-shy", "害羞", "emotion", 1, { boundary: 2, vulnerability: 1 }),
    card("f1-happy", "开心", "emotion", 1, { hope: 2 }),
    card("f1-confused", "困惑", "emotion", 1, { uncertainty: 2 }),
    card("f1-go", "出发", "action", 1, { agency: 2, adventure: 2 }),
    card("f1-knock", "敲门", "action", 1, { boundary: 2, connection_need: 1 }),
    card("f1-search", "寻找", "action", 1, { adventure: 1, being_seen: 1 }),
    card("f1-near", "走近", "action", 1, { trust: 1, connection_need: 2 }),
    card("f1-run", "跑起来", "action", 1, { freedom: 2, agency: 2 }),
    card("f1-stop", "停下来", "action", 1, { patience: 2, boundary: 1 }),

    card("f2-lamp", "小灯", "symbol", 2, { safety: 2, hope: 2 }),
    card("f2-blocks", "积木", "symbol", 2, { repair: 1, imagination: 2 }),
    card("f2-cat", "会说话的猫", "symbol", 2, { imagination: 2, connection_need: 1 }),
    card("f2-tree-hole", "树洞", "symbol", 2, { boundary: 1, safety: 1 }),
    card("f2-bell", "铃铛", "symbol", 2, { being_seen: 2 }),
    card("f2-blanket", "毛毯", "symbol", 2, { safety: 2, protection: 2 }),
    card("f2-safe", "安心", "emotion", 2, { safety: 2, trust: 1 }),
    card("f2-shy", "害羞", "emotion", 2, { boundary: 2, vulnerability: 1 }),
    card("f2-happy", "开心", "emotion", 2, { hope: 2 }),
    card("f2-careful", "小心", "emotion", 2, { caution: 2 }),
    card("f2-surprise", "惊喜", "emotion", 2, { hope: 1, imagination: 1 }),
    card("f2-relax", "放松", "emotion", 2, { safety: 2, trust: 1 }),
    card("f2-share", "分享", "action", 2, { connection_need: 2, trust: 1 }),
    card("f2-wait", "等待", "action", 2, { patience: 2, caution: 1 }),
    card("f2-exchange", "交换", "action", 2, { relationship: 2, trust: 1 }),
    card("f2-listen", "倾听", "action", 2, { being_seen: 2, connection_need: 1 }),
    card("f2-near", "靠近", "action", 2, { connection_need: 2, trust: 1 }),
    card("f2-sit", "坐下", "action", 2, { patience: 1, safety: 1 }),

    card("f3-umbrella", "雨伞", "symbol", 3, { safety: 2, boundary: 2, protection: 1 }),
    card("f3-paper-boat", "纸船", "symbol", 3, { hope: 1, vulnerability: 1 }),
    card("f3-dark-puddle", "黑色水洼", "symbol", 3, { sadness: 2, uncertainty: 1 }),
    card("f3-closed-door", "关上的门", "symbol", 3, { boundary: 2, avoidance: 1 }),
    card("f3-broken-crayon", "断掉的蜡笔", "symbol", 3, { repair: 2, sadness: 1 }),
    card("f3-empty-room", "空房间", "symbol", 3, { loneliness: 2, being_seen: 1 }),
    card("f3-lonely", "孤单", "emotion", 3, { connection_need: 2, sadness: 2 }),
    card("f3-scared", "害怕", "emotion", 3, { safety: 2, vulnerability: 2 }),
    card("f3-wronged", "委屈", "emotion", 3, { being_seen: 2, sadness: 2 }),
    card("f3-angry", "生气", "emotion", 3, { boundary: 2, control: 1 }),
    card("f3-sad", "难过", "emotion", 3, { sadness: 2 }),
    card("f3-miss", "想念", "emotion", 3, { connection_need: 2, home: 1 }),
    card("f3-hide", "躲藏", "action", 3, { avoidance: 2, safety: 1 }),
    card("f3-protect", "保护", "action", 3, { protection: 2, safety: 1 }),
    card("f3-stop", "停下来", "action", 3, { patience: 2 }),
    card("f3-wait", "等待", "action", 3, { patience: 2, caution: 1 }),
    card("f3-hug", "抱紧", "action", 3, { protection: 2, connection_need: 1 }),
    card("f3-call", "呼唤", "action", 3, { being_seen: 2, connection_need: 2 }),

    card("f4-moonlight", "月光", "symbol", 4, { hope: 2, safety: 1 }),
    card("f4-seed", "发光种子", "symbol", 4, { hope: 2, repair: 1 }),
    card("f4-cloud-ladder", "云朵梯子", "symbol", 4, { adventure: 2, imagination: 2 }),
    card("f4-key", "小钥匙", "symbol", 4, { agency: 2, boundary: 1 }),
    card("f4-dandelion", "蒲公英", "symbol", 4, { freedom: 2, hope: 1 }),
    card("f4-map", "旧地图", "symbol", 4, { adventure: 2, control: 1 }),
    card("f4-brave", "勇敢", "emotion", 4, { agency: 2, trust: 1 }),
    card("f4-confused", "困惑", "emotion", 4, { uncertainty: 2 }),
    card("f4-reluctant", "舍不得", "emotion", 4, { connection_need: 1, home: 1 }),
    card("f4-safe", "安心", "emotion", 4, { safety: 2, trust: 1 }),
    card("f4-expect", "期待", "emotion", 4, { hope: 2 }),
    card("f4-hesitate", "犹豫", "emotion", 4, { caution: 2 }),
    card("f4-open", "打开", "action", 4, { agency: 2, trust: 1 }),
    card("f4-fix", "修好", "action", 4, { repair: 2, agency: 1 }),
    card("f4-look-back", "回头", "action", 4, { relationship: 1, caution: 1 }),
    card("f4-light", "点亮", "action", 4, { hope: 2, repair: 1 }),
    card("f4-let-go", "放手", "action", 4, { freedom: 2, sadness: 1 }),
    card("f4-restart", "重新开始", "action", 4, { repair: 2, hope: 1 }),

    card("f5-book", "童话书", "symbol", 5, { imagination: 2, being_seen: 1 }),
    card("f5-star", "星星", "symbol", 5, { hope: 2, imagination: 1 }),
    card("f5-window", "顶楼窗户", "symbol", 5, { being_seen: 2, boundary: 1 }),
    card("f5-sky", "蓝绿色天空", "symbol", 5, { freedom: 1, safety: 1 }),
    card("f5-page", "空白页", "symbol", 5, { imagination: 2, possibility: 2 }),
    card("f5-sticker", "小贴纸", "symbol", 5, { being_seen: 1, connection_need: 1 }),
    card("f5-understood", "被理解", "emotion", 5, { being_seen: 2, connection_need: 2 }),
    card("f5-relax", "放松", "emotion", 5, { safety: 2, trust: 1 }),
    card("f5-miss", "想念", "emotion", 5, { connection_need: 2, home: 1 }),
    card("f5-safe", "安心", "emotion", 5, { safety: 2, trust: 1 }),
    card("f5-expect", "期待", "emotion", 5, { hope: 2 }),
    card("f5-happy", "开心", "emotion", 5, { hope: 2 }),
    card("f5-give", "送给", "action", 5, { connection_need: 2, trust: 1 }),
    card("f5-company", "陪伴", "action", 5, { connection_need: 2, safety: 1 }),
    card("f5-home", "回家", "action", 5, { home: 2, safety: 1 }),
    card("f5-together", "坐在一起", "action", 5, { connection_need: 2, trust: 1 }),
    card("f5-write", "写下", "action", 5, { agency: 1, being_seen: 1 }),
    card("f5-collect", "收藏", "action", 5, { memory: 2, safety: 1 })
  ];

  const state = loadState() || {
    screen: "start",
    currentFloor: 1,
    phase: "select",
    drawnCards: [],
    selectedIds: {},
    story: "",
    drafts: [],
    bookPage: 0,
    portrait: null
  };

  state.phase = state.phase || "select";
  if (state.screen === "response") {
    state.screen = "floor";
    state.phase = "result";
  }

  function card(id, word, category, floor, tags) {
    return { id, word, category, floor, tags };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(text) {
    return text.replace(/\s+/g, "").replace(/[，。！？、,.!?;；:："'“”‘’（）()[\]《》<>]/g, "");
  }

  function coreChars(text) {
    return Array.from(new Set(Array.from(normalizeText(text)).filter((char) => !looseChars.has(char))));
  }

  function hasCharsInOrder(chars, story) {
    let cursor = 0;
    return chars.every((char) => {
      const index = story.indexOf(char, cursor);
      if (index === -1) return false;
      cursor = index + 1;
      return true;
    });
  }

  function wordAppearsLoosely(word, story) {
    const normalizedWord = normalizeText(word);
    const normalizedStory = normalizeText(story);
    if (normalizedStory.includes(normalizedWord)) return true;
    const chars = coreChars(normalizedWord);
    if (chars.length === 0) return true;
    return chars.every((char) => normalizedStory.includes(char)) || hasCharsInOrder(chars, normalizedStory);
  }

  function validateStory(selectedWords, story) {
    if (selectedWords.length !== 3) {
      return "每一类词卡都选一张，再讲给朋友听。";
    }
    if (!story.trim()) {
      return "朋友还在等这段故事。不用写得完美，先讲一点也可以。";
    }
    return "";
  }

  function softMissingWords(selectedWords, story) {
    const missing = selectedWords.filter((word) => !wordAppearsLoosely(word, story));
    return missing;
  }

  function shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
  }

  function drawCardsForFloor(floorNumber) {
    const usedIds = new Set(state.drafts.flatMap((draft) => draft.selectedIds));
    const previousWords = state.drafts.flatMap((draft) => draft.selectedWords);

    state.drawnCards = categories.flatMap((category) => {
      const candidates = wordCards.filter(
        (item) => item.floor === floorNumber && item.category === category && !usedIds.has(item.id)
      );
      const picked = shuffle(candidates).slice(0, 3);

      if (floorNumber === 5 && category === "symbol" && previousWords.length > 0) {
        const memoryCard = card(`memory-${previousWords[0]}`, previousWords[0], "symbol", 5, {
          memory: 2,
          being_seen: 1
        });
        return shuffle([memoryCard, ...picked]).slice(0, 3);
      }

      return picked;
    });
    state.selectedIds = {};
    state.story = "";
    state.error = "";
    state.phase = "select";
    saveState();
  }

  function selectedWords() {
    return categories
      .map((category) => state.drawnCards.find((cardItem) => cardItem.id === state.selectedIds[category]))
      .filter(Boolean)
      .map((cardItem) => cardItem.word);
  }

  function currentFloor() {
    return floors.find((item) => item.floor === state.currentFloor) || floors[0];
  }

  function setScreen(screen) {
    state.screen = screen;
    if (screen === "floor" && state.drawnCards.length === 0) {
      drawCardsForFloor(state.currentFloor);
    }
    saveState();
    render();
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  }

  function resetGame() {
    localStorage.removeItem(storageKey);
    Object.assign(state, {
      screen: "start",
      currentFloor: 1,
      phase: "select",
      drawnCards: [],
      selectedIds: {},
      story: "",
      drafts: [],
      bookPage: 0,
      portrait: null,
      error: ""
    });
    render();
  }

  function submitStory() {
    const words = selectedWords();
    const message = validateStory(words, state.story);
    if (message) {
      state.error = message;
      render();
      return;
    }

    state.drafts = [
      ...state.drafts.filter((draft) => draft.floor !== state.currentFloor),
      {
        floor: state.currentFloor,
        selectedWords: words,
        selectedIds: categories.map((category) => state.selectedIds[category]),
        userStory: state.story.trim(),
        timestamp: Date.now()
      }
    ];
    state.phase = "result";
    state.error = "";
    saveState();
    render();
  }

  function goNextFloor() {
    if (state.currentFloor >= 5) {
      state.screen = "book";
      state.bookPage = 0;
    } else {
      state.currentFloor += 1;
      state.screen = "floor";
      state.phase = "select";
      drawCardsForFloor(state.currentFloor);
    }
    saveState();
    render();
  }

  function collectTagScores() {
    const scores = {};
    state.drafts.forEach((draft) => {
      draft.selectedIds.forEach((id) => {
        const source =
          wordCards.find((item) => item.id === id) ||
          wordCards.find((item) => item.word === String(id).replace("memory-", ""));
        if (!source) return;
        Object.entries(source.tags).forEach(([tag, value]) => {
          scores[tag] = (scores[tag] || 0) + value;
        });
      });
    });
    return scores;
  }

  function buildPortrait() {
    const scores = collectTagScores();
    const tags = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
    const words = Array.from(new Set(state.drafts.flatMap((draft) => draft.selectedWords))).slice(0, 5);
    const mainTag = tags[0] || "imagination";
    const names = {
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
    const hasSafety = tags.includes("safety") || tags.includes("protection");
    const hasConnection = tags.includes("connection_need") || tags.includes("being_seen");
    const hasAdventure = tags.includes("adventure") || tags.includes("freedom");
    const hasRepair = tags.includes("repair");

    state.portrait = {
      portraitName: names[mainTag] || "把故事递出去的人",
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
    state.screen = "portrait";
    saveState();
    render();
  }

  function generateIllustrationPrompt(draft) {
    if (!draft) return "";
    return `儿童绘本风，蜡笔质感，纸张纹理，温柔安静，低饱和。请根据这段童话生成一张插图：${draft.userStory}。必须包含这些词语意象：${draft.selectedWords.join("、")}。不要文字，不要真实照片。`;
  }

  function ambientMarkup() {
    return `
      <div class="ambient-stairs" aria-hidden="true">
        <span class="window-glow"></span>
        <span class="ambient-step"></span>
        <span class="ambient-step"></span>
        <span class="ambient-step"></span>
        <span class="ambient-plane"></span>
      </div>
    `;
  }

  function renderStart() {
    const continueButton =
      state.drafts.length > 0 ? `<button class="ghost-button" data-action="continue">继续故事</button>` : "";
    return `
      <section class="scene-shell start-scene art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_start_tower.png')">
        <div class="scene-dim"></div>
        <img class="start-child" src="${assetBase}/02_characters/child_back.png" alt="" />
        <img class="start-friend" src="${assetBase}/02_characters/friend_silhouette.png" alt="" />
        <div class="guide-visual" aria-hidden="true">
          <span></span>
        </div>
        <div class="scene-title-bar">
          <p class="eyebrow">疗愈型网页叙事游戏</p>
          <h1>顶楼的童话书</h1>
        </div>
        <div class="scene-action-row">
          <button class="primary-button" data-action="intro">游戏引导</button>
          ${continueButton}
        </div>
      </section>
    `;
  }

  function renderIntro() {
    return `
      <section class="scene-shell art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_start_tower.png')">
        <div class="scene-dim"></div>
        <section class="guide-panel">
          <h2>游戏引导</h2>
          <p>朋友住在顶楼。ta 会在每一层留下几张词卡。</p>
          <p>你从三类词里各选一个，再把它们讲进故事里。</p>
          <p>故事讲完后，楼梯间会出现朋友的回应。</p>
          <button class="primary-button" data-action="start-floor">开始上楼</button>
        </section>
      </section>
    `;
  }

  function renderFloor() {
    const floor = currentFloor();
    const words = selectedWords();
    const missing = softMissingWords(words, state.story);
    const wordGroups = categories
      .map((category) => {
        const cards = state.drawnCards
          .filter((item) => item.category === category)
          .map((item) => {
            const hasSelected = Boolean(state.selectedIds[category]);
            const selected = state.selectedIds[category] === item.id;
            const dimmed = hasSelected && !selected;
            return `<button class="choice-pill ${selected ? "selected" : ""} ${dimmed ? "dimmed" : ""}" data-action="select-card" data-category="${category}" data-id="${item.id}">${escapeHtml(item.word)}</button>`;
          })
          .join("");
        return `
          <div class="choice-group">
            <p><span>${categoryLabels[category]}</span></p>
            <div class="choice-row">${cards}</div>
          </div>
        `;
      })
      .join("");

    return `
      <section class="floor-shell art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_stair_${floor.floor}f.png')">
        <div class="background-dim"></div>
        <header class="floor-hud">
          <span>${floor.floor}F</span>
          <strong>${floor.stage}</strong>
          <span>${state.drafts.length}/5</span>
        </header>
        <p class="story-whisper">${state.phase === "result" ? floor.response.line : floor.prompt}</p>
        <section class="choice-panel" aria-label="词语选择">
          <h2>选词卡</h2>
          <p class="choice-hint">每一类选一个词。选好后，故事书页会从下面滑出来。</p>
          ${wordGroups}
        </section>
        ${state.phase === "write" ? renderStoryDock(words, missing) : ""}
        ${state.phase === "result" ? renderFeedbackOverlay(floor) : ""}
      </section>
    `;
  }

  function renderStoryDock(words, missing) {
    const tip =
      missing.length > 0 && state.story.trim()
        ? `<p class="soft-note">朋友好像还没完全听见：${escapeHtml(missing.join("、"))}。不影响提交，只是提醒一下。</p>`
        : "";

    return `
      <section class="story-input-dock" aria-label="输入故事">
        <div class="dock-selected">
          ${words.map((word) => `<span>${escapeHtml(word)}</span>`).join("")}
        </div>
        <div class="story-entry-row">
          <label class="story-label" for="story-input">写给朋友</label>
          <input id="story-input" type="text" value="${escapeHtml(state.story)}" placeholder="把这 3 个词讲进故事里。" autocomplete="off" />
          <button class="dock-submit" data-action="submit-story">讲给朋友听</button>
        </div>
        ${tip}
        ${state.error ? `<p class="error-text">${escapeHtml(state.error)}</p>` : ""}
      </section>
    `;
  }

  function renderFeedbackOverlay(floor) {
    return `
      <section class="feedback-float" aria-label="朋友反馈">
        <img class="feedback-prop" src="${assetBase}/03_props/${propByFloor[floor.floor]}" alt="" />
        <p>${floor.response.change}</p>
        <strong>“${floor.response.line}”</strong>
        <button class="primary-button" data-action="next-floor">${state.currentFloor >= 5 ? "装订童话书" : "继续上楼"}</button>
      </section>
    `;
  }

  function renderBook() {
    const page = state.bookPage || 0;
    const draft = state.drafts[page - 1];
    const isCover = page === 0;
    const pageHtml = isCover
      ? `
        <p>这些故事被轻轻夹进纸页里，送给顶楼的朋友。</p>
      `
      : `
        <div class="book-illustration" aria-label="故事插图" title="${escapeHtml(generateIllustrationPrompt(draft))}">
          <span>AI 插图待生成</span>
        </div>
        <p class="book-page-index">第 ${draft.floor} 页</p>
        <p class="book-story-text">${escapeHtml(draft.userStory)}</p>
      `;
    const image = isCover ? "book_cover.png" : "book_page_template.png";

    return `
      <section class="scene-shell book-scene art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_stair_5f.png')">
        <div class="scene-dim"></div>
        <div class="book-layout">
          <div class="book-page art-backed" style="background-image: linear-gradient(90deg, rgba(181,138,98,0.12), transparent 36px), linear-gradient(rgba(255,253,244,0.72), rgba(255,253,244,0.72)), url('${assetBase}/05_book/${image}')">
            ${pageHtml}
          </div>
          <div class="book-controls">
            <button class="ghost-button" data-action="book-prev" ${page === 0 ? "disabled" : ""}>上一页</button>
            <span>${page + 1} / 6</span>
            <button class="ghost-button" data-action="book-next" ${page === 5 ? "disabled" : ""}>下一页</button>
          </div>
          <button class="primary-button" data-action="portrait">查看我的故事画像</button>
        </div>
      </section>
    `;
  }

  function renderPortrait() {
    const portrait = state.portrait;
    const symbols = portrait.mainSymbols.map((symbol) => `<span>${escapeHtml(symbol)}</span>`).join("");
    return `
      <section class="scene-shell analysis-scene art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_stair_5f.png')">
        <div class="scene-dim"></div>
        <section class="analysis-panel">
          <h2>分析</h2>
          <p class="eyebrow">你的童话画像</p>
          <h3>${escapeHtml(portrait.portraitName)}</h3>
          <div class="symbol-list">${symbols}</div>
          <p>${escapeHtml(portrait.emotionalTone)}</p>
          <p>${escapeHtml(portrait.relationshipPattern)}</p>
          <p>${escapeHtml(portrait.agencyPattern)}</p>
          <p>${escapeHtml(portrait.safetyAndNeed)}</p>
          <blockquote>${escapeHtml(portrait.fairyTaleSummary)}</blockquote>
          <strong>${escapeHtml(portrait.finalMessage)}</strong>
          <div class="button-row">
            <button class="primary-button" data-action="reset">重新开始</button>
            <button class="ghost-button" data-action="back-book">回看童话书</button>
          </div>
        </section>
      </section>
    `;
  }

  function render() {
    if (!state.drawnCards.length && state.screen === "floor") {
      drawCardsForFloor(state.currentFloor);
      return;
    }

    const views = {
      start: renderStart,
      intro: renderIntro,
      floor: renderFloor,
      book: renderBook,
      portrait: renderPortrait
    };
    app.innerHTML = views[state.screen]();
    bindEvents();
  }

  function bindEvents() {
    app.querySelectorAll("[data-action]").forEach((node) => {
      node.addEventListener("click", () => {
        const action = node.dataset.action;
        if (action === "intro") setScreen("intro");
        if (action === "continue") setScreen("floor");
        if (action === "start-floor") {
          state.currentFloor = 1;
          drawCardsForFloor(1);
          setScreen("floor");
        }
        if (action === "select-card") {
          state.selectedIds[node.dataset.category] = node.dataset.id;
          state.error = "";
          if (selectedWords().length === 3) {
            state.phase = "write";
          }
          saveState();
          render();
        }
        if (action === "close-input") {
          state.phase = "select";
          state.error = "";
          saveState();
          render();
        }
        if (action === "submit-story") submitStory();
        if (action === "next-floor") goNextFloor();
        if (action === "book-prev") {
          state.bookPage = Math.max(0, state.bookPage - 1);
          saveState();
          render();
        }
        if (action === "book-next") {
          state.bookPage = Math.min(5, state.bookPage + 1);
          saveState();
          render();
        }
        if (action === "portrait") buildPortrait();
        if (action === "reset") resetGame();
        if (action === "back-book") setScreen("book");
      });
    });

    const input = app.querySelector("#story-input");
    if (input) {
      input.addEventListener("input", (event) => {
        state.story = event.target.value;
        saveState();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          submitStory();
        }
      });
    }
  }

  render();
})();
