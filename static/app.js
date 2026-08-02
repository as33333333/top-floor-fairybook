(function () {
  const app = document.querySelector("#app");
  const storageKey = "top-floor-fairybook-static-session";
  const categories = ["subject", "symbol", "emotion", "action"];
  const categoryLabels = {
    subject: "主体词",
    symbol: "意象词",
    emotion: "情绪词",
    action: "行动词"
  };
  const isLocalStaticPreview =
    ["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.pathname.includes("/static/");
  const assetBase =
    window.location.protocol === "file:" || isLocalStaticPreview ? "../public/art_assets" : "./art_assets";
  const looseChars = new Set(["的", "地", "得", "了", "着", "过", "在", "一", "个", "只", "很", "被"]);
  const preloadedImages = new Set();

  const floors = [
    {
      floor: 1,
      stage: "开始",
      title: "故事开始了",
      prompt: "朋友把几张词卡放在第一层的门口。请选择 4 个词，作为故事的开头。",
      helper: "故事里可以出现一个小角色，ta 准备去某个地方，或者发现了一件奇怪的小事。",
      cue: "门缝",
      response: {
        change: "楼梯墙上出现一行很浅的蜡笔字。",
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
        change: "楼梯墙上的一盏小灯亮起。",
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
    card("f1-deer", "小鹿", "subject", 1, { vulnerability: 1, adventure: 1 }),
    card("f1-ant", "蚂蚁", "subject", 1, { agency: 2, patience: 1 }),
    card("f1-fox", "小狐狸", "subject", 1, { imagination: 1, caution: 1 }),
    card("f1-dandelion", "蒲公英", "subject", 1, { freedom: 2, hope: 1 }),
    card("f1-sparrow", "麻雀", "subject", 1, { freedom: 1, connection_need: 1 }),
    card("f1-snail", "小蜗牛", "subject", 1, { patience: 2, safety: 1 }),
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

    card("f2-black-cat", "黑猫", "subject", 2, { boundary: 1, imagination: 1 }),
    card("f2-firefly", "萤火虫", "subject", 2, { hope: 2, connection_need: 1 }),
    card("f2-rabbit", "小兔子", "subject", 2, { vulnerability: 1, caution: 1 }),
    card("f2-moss", "苔藓", "subject", 2, { patience: 2, safety: 1 }),
    card("f2-oak", "橡树", "subject", 2, { safety: 2, home: 1 }),
    card("f2-goldfish", "金鱼", "subject", 2, { imagination: 1, freedom: 1 }),
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

    card("f3-swallow", "雨燕", "subject", 3, { freedom: 1, vulnerability: 1 }),
    card("f3-hedgehog", "刺猬", "subject", 3, { boundary: 2, protection: 1 }),
    card("f3-mushroom", "蘑菇", "subject", 3, { imagination: 1, safety: 1 }),
    card("f3-bear", "小熊", "subject", 3, { protection: 1, vulnerability: 1 }),
    card("f3-earthworm", "蚯蚓", "subject", 3, { patience: 1, repair: 1 }),
    card("f3-turtle", "小海龟", "subject", 3, { safety: 2, patience: 1 }),
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

    card("f4-white-deer", "白鹿", "subject", 4, { adventure: 1, imagination: 1 }),
    card("f4-butterfly", "蝴蝶", "subject", 4, { freedom: 2, repair: 1 }),
    card("f4-sprout", "发芽豆子", "subject", 4, { hope: 2, repair: 1 }),
    card("f4-tit", "山雀", "subject", 4, { freedom: 1, connection_need: 1 }),
    card("f4-squirrel", "小松鼠", "subject", 4, { agency: 1, home: 1 }),
    card("f4-ginkgo", "银杏树", "subject", 4, { patience: 1, hope: 1 }),
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

    card("f5-star-bird", "星星鸟", "subject", 5, { hope: 2, imagination: 1 }),
    card("f5-whale", "小鲸鱼", "subject", 5, { freedom: 1, connection_need: 1 }),
    card("f5-giraffe", "长颈鹿", "subject", 5, { adventure: 1, being_seen: 1 }),
    card("f5-daisy", "雏菊", "subject", 5, { hope: 1, safety: 1 }),
    card("f5-dog", "小狗", "subject", 5, { trust: 2, connection_need: 1 }),
    card("f5-moon-fish", "月亮鱼", "subject", 5, { imagination: 2, freedom: 1 }),
    card("f5-book", "童话书", "symbol", 5, { imagination: 2, being_seen: 1 }),
    card("f5-star", "星星", "symbol", 5, { hope: 2, imagination: 1 }),
    card("f5-window", "顶楼窗户", "symbol", 5, { being_seen: 2, boundary: 1 }),
    card("f5-sky", "蓝绿色天空", "symbol", 5, { freedom: 1, safety: 1 }),
    card("f5-page", "空白页", "symbol", 5, { imagination: 2, possibility: 2 }),
    card("f5-envelope", "小信封", "symbol", 5, { being_seen: 1, connection_need: 1 }),
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
    portrait: null,
    illustrations: {}
  };

  state.phase = state.phase || "select";
  state.illustrations = state.illustrations || {};
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
    if (selectedWords.length !== categories.length) {
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

  function previousCategoryCards(category, floorNumber) {
    const categoryIndex = categories.indexOf(category);
    const previousDrafts = [...state.drafts]
      .filter((draft) => draft.floor < floorNumber)
      .sort((a, b) => a.floor - b.floor);
    const seenWords = new Set();

    return previousDrafts
      .map((draft) => {
        const selectedId = draft.selectedIds[categoryIndex];
        const selectedWord = draft.selectedWords[categoryIndex];
        return (
          wordCards.find((item) => item.id === selectedId) ||
          card(selectedId, selectedWord, category, draft.floor, {})
        );
      })
      .filter((item) => {
        if (!item?.word || seenWords.has(item.word)) return false;
        seenWords.add(item.word);
        return true;
      })
      .slice(0, 4);
  }

  function ensurePreviousWordCandidates() {
    if (state.currentFloor <= 1 || state.phase === "result") return;
    let changed = false;

    categories.forEach((category) => {
      const previousOptions = previousCategoryCards(category, state.currentFloor);
      const currentOptions = state.drawnCards.filter((item) => item.category === category);
      if (
        previousOptions.length === 0 ||
        (currentOptions.length === 5 &&
          previousOptions.every((previous) =>
            currentOptions.some((current) => current.word === previous.word)
          ))
      ) {
        return;
      }

      const selectedOption = currentOptions.find(
        (item) => item.id === state.selectedIds[category]
      );
      const remainingOptions = currentOptions.filter(
        (item) =>
          !previousOptions.some((previous) => previous.word === item.word) &&
          item.id !== selectedOption?.id
      );
      const existingWords = new Set([
        ...previousOptions.map((item) => item.word),
        ...(selectedOption ? [selectedOption.word] : []),
        ...remainingOptions.map((item) => item.word)
      ]);
      const additions = shuffle(
        wordCards.filter(
          (item) =>
            item.floor === state.currentFloor &&
            item.category === category &&
            !existingWords.has(item.word)
        )
      );
      const nextOptions = [
        ...previousOptions,
        ...(selectedOption && !previousOptions.some((item) => item.word === selectedOption.word)
          ? [selectedOption]
          : []),
        ...remainingOptions,
        ...additions
      ].slice(0, 5);
      state.drawnCards = [
        ...state.drawnCards.filter((item) => item.category !== category),
        ...nextOptions
      ];
      changed = true;
    });

    if (changed) saveState();
  }

  function ensureFiveWordOptions() {
    let changed = false;
    categories.forEach((category) => {
      const currentOptions = state.drawnCards.filter((item) => item.category === category);
      if (currentOptions.length >= 5) return;

      const currentIds = new Set(currentOptions.map((item) => item.id));
      const additions = shuffle(
        wordCards.filter(
          (item) =>
            item.floor === state.currentFloor &&
            item.category === category &&
            !currentIds.has(item.id)
        )
      ).slice(0, 5 - currentOptions.length);
      if (additions.length === 0) return;
      state.drawnCards.push(...additions);
      changed = true;
    });
    if (changed) saveState();
  }

  function drawCardsForFloor(floorNumber) {
    const usedIds = new Set(state.drafts.flatMap((draft) => draft.selectedIds));

    state.drawnCards = categories.flatMap((category) => {
      const previousOptions = previousCategoryCards(category, floorNumber);
      const candidates = wordCards.filter(
        (item) => item.floor === floorNumber && item.category === category && !usedIds.has(item.id)
      );
      const picked = shuffle(candidates).slice(0, 5);

      if (previousOptions.length > 0) {
        const fillCount = 5 - previousOptions.length;
        const currentOptions = picked
          .filter((item) => !previousOptions.some((previous) => previous.word === item.word))
          .slice(0, fillCount);
        return [...previousOptions, ...currentOptions];
      }

      return picked;
    });
    state.selectedIds = {};
    state.story = "";
    state.error = "";
    state.phase = "select";
    saveState();
  }

  function refreshCategory(category) {
    const usedIds = new Set(state.drafts.flatMap((draft) => draft.selectedIds));
    const visibleIds = new Set(
      state.drawnCards.filter((item) => item.category === category).map((item) => item.id)
    );
    const pool = wordCards.filter(
      (item) =>
        item.floor === state.currentFloor &&
        item.category === category &&
        !usedIds.has(item.id) &&
        !visibleIds.has(item.id)
    );
    const previousOptions = previousCategoryCards(category, state.currentFloor);
    const replacementCount = 5 - previousOptions.length;
    const preferredPool = pool.filter(
      (item) => !previousOptions.some((previous) => previous.word === item.word)
    );
    const reusablePool = wordCards.filter(
      (item) =>
        item.floor === state.currentFloor &&
        item.category === category &&
        !preferredPool.some((preferred) => preferred.id === item.id) &&
        !previousOptions.some((previous) => previous.word === item.word)
    );
    const replacements = [...shuffle(preferredPool), ...shuffle(reusablePool)].slice(
      0,
      replacementCount
    );
    if (replacements.length < replacementCount) return;

    state.drawnCards = [
      ...state.drawnCards.filter((item) => item.category !== category),
      ...previousOptions,
      ...replacements
    ];
    delete state.selectedIds[category];
    state.phase = selectedWords().length === categories.length ? "write" : "select";
    state.error = "";
    saveState();
    render();
  }

  function selectedWords() {
    return categories
      .map((category) => state.drawnCards.find((cardItem) => cardItem.id === state.selectedIds[category]))
      .filter(Boolean)
      .map((cardItem) => cardItem.word);
  }

  function selectedWordMap() {
    return Object.fromEntries(
      categories.map((category) => [
        category,
        state.drawnCards.find((item) => item.id === state.selectedIds[category])?.word || ""
      ])
    );
  }

  function generateRandomStorySentence() {
    const { subject, symbol, emotion, action } = selectedWordMap();
    const templates = {
      1: [
        `${subject}来到${symbol}旁，感到${emotion}，于是决定${action}。`,
        `故事从${symbol}旁开始：${subject}带着${emotion}的心情，慢慢地${action}。`,
        `${subject}发现了${symbol}，心里有些${emotion}，却还是试着${action}。`
      ],
      2: [
        `${subject}在${symbol}旁遇见了一个新朋友，感到${emotion}，便试着${action}。`,
        `走到${symbol}附近时，${subject}感到${emotion}，于是和刚遇见的朋友一起${action}。`,
        `${symbol}旁传来轻轻的声音，${subject}怀着${emotion}，决定靠过去${action}。`
      ],
      3: [
        `当${symbol}出现在眼前，${subject}感到${emotion}，只好先${action}。`,
        `${subject}在${symbol}旁遇到了困难，心里十分${emotion}，于是决定${action}。`,
        `四周忽然安静下来，${subject}望着${symbol}，带着${emotion}的感觉慢慢${action}。`
      ],
      4: [
        `${subject}望着${symbol}，感到${emotion}，还是选择${action}，故事也因此转了弯。`,
        `${symbol}让${subject}心里升起${emotion}的感觉，ta决定${action}，让事情有一点不同。`,
        `这一次，${subject}带着${emotion}走到${symbol}旁，轻轻地${action}。`
      ],
      5: [
        `${subject}把${symbol}写进最后一页，感到${emotion}，并决定${action}，把故事留给朋友。`,
        `故事的最后，${subject}带着${emotion}来到${symbol}旁，选择${action}。`,
        `${subject}望着${symbol}，终于感到${emotion}，于是${action}，为故事写下了结尾。`
      ]
    };
    const floorTemplates = templates[state.currentFloor] || templates[1];
    return floorTemplates[Math.floor(Math.random() * floorTemplates.length)];
  }

  function currentFloor() {
    return floors.find((item) => item.floor === state.currentFloor) || floors[0];
  }

  function setScreen(screen) {
    state.screen = screen;
    if (
      screen === "floor" &&
      (state.drawnCards.length === 0 ||
        (state.phase !== "result" && !state.drawnCards.some((item) => item.category === "subject")))
    ) {
      drawCardsForFloor(state.currentFloor);
    }
    if (screen === "book") {
      preloadImage(`${assetBase}/05_book/book_cover.webp`);
      preloadImage(`${assetBase}/05_book/book_page_template.webp`);
    }
    saveState();
    render();
  }

  function saveState() {
    const storageState = {
      ...state,
      illustrations: Object.fromEntries(
        Object.entries(state.illustrations || {}).map(([floor, illustration]) => [
          floor,
          {
            ...illustration,
            image:
              typeof illustration.image === "string" && illustration.image.startsWith("data:")
                ? null
                : illustration.image
          }
        ])
      )
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(storageState));
    } catch {
      // The story remains playable even if the browser has exhausted its local quota.
    }
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
      illustrations: {},
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

    const draft = {
      floor: state.currentFloor,
      selectedWords: words,
      selectedIds: categories.map((category) => state.selectedIds[category]),
      userStory: state.story.trim(),
      timestamp: Date.now()
    };
    state.drafts = [
      ...state.drafts.filter((draft) => draft.floor !== state.currentFloor),
      draft
    ];
    state.phase = "result";
    state.error = "";
    saveState();
    render();
    queueIllustration(draft);
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

  function restoreFloorForEditing(floorNumber) {
    const draft = state.drafts.find((item) => item.floor === floorNumber);
    state.currentFloor = floorNumber;
    state.screen = "floor";

    if (!draft) {
      drawCardsForFloor(floorNumber);
      render();
      return;
    }

    state.selectedIds = {};
    state.drawnCards = categories.flatMap((category, index) => {
      const selectedId = draft.selectedIds[index];
      const selectedCard =
        wordCards.find((item) => item.id === selectedId) ||
        card(selectedId, draft.selectedWords[index], category, floorNumber, {});
      const previousOptions = previousCategoryCards(category, floorNumber);
      const fixedAlternatives = previousOptions.filter(
        (previous) => previous.word !== selectedCard.word
      );
      const alternatives = shuffle(
        wordCards.filter(
          (item) =>
            item.floor === floorNumber &&
            item.category === category &&
            item.id !== selectedCard.id &&
            !fixedAlternatives.some((fixed) => fixed.id === item.id)
        )
      ).slice(0, 4 - fixedAlternatives.length);
      state.selectedIds[category] = selectedCard.id;
      return [selectedCard, ...fixedAlternatives, ...alternatives];
    });
    state.story = draft.userStory;
    state.phase = "write";
    state.error = "";
    saveState();
    render();
  }

  function goPreviousStep() {
    if (state.phase === "result") {
      restoreFloorForEditing(state.currentFloor);
      return;
    }
    if (state.currentFloor > 1) {
      restoreFloorForEditing(state.currentFloor - 1);
    }
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
    const words = Array.from(new Set(state.drafts.flatMap((draft) => draft.selectedWords))).slice(0, 6);
    const storyText = state.drafts.map((draft) => draft.userStory).join(" ");
    const evidence = words.slice(0, 4).join("、") || "故事里的角色与动作";
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
      storyEvidence: `你在五段故事里选择了「${evidence}」这样的线索。它们不是结论，只是这次创作里反复被你放到画面中央的东西。`,
      emotionalTone: hasSafety
        ? "从情绪走向看，故事会先确认安全，再允许变化发生。紧张或难过没有被立刻抹去，而是被灯、门、保护与等待轻轻托住。"
        : "故事的情绪并不只有明亮的一面，不确定、犹豫与希望并存。你允许角色带着复杂感受继续往前走。",
      relationshipPattern: hasConnection
        ? "关系往往通过等待、倾听、分享与小回应建立。角色很少突然闯入，更重视对方是否准备好，也在意自己的边界有没有被看见。"
        : "角色倾向于先观察、理解环境，再决定是否靠近。这种节奏里既有谨慎，也保留了把心里话递出去的可能。",
      agencyPattern: hasAdventure
        ? "面对变化时，角色会用出发、寻找或打开来恢复主动感。即使有犹豫，故事仍倾向于让行动创造新的出口。"
        : "面对困难时，角色不急着证明勇敢，而是停下、观察、等待，等到内在有了把握，再做一个能够承受的小选择。",
      safetyAndNeed: hasSafety
        ? "故事把安全感放在可见、可掌控的小事物里：一盏灯、一扇门、一把伞，或一个愿意等待的存在。也许你珍惜的是不催促、能回应、又允许保留距离的陪伴。"
        : "故事里的安全感更多来自理解情境与保留选择。也许你既希望被认真听见，也需要一个不会被立刻解释或推动的安静角落。",
      innerPortrait: hasRepair
        ? "从故事望向内心，你似乎更相信关系和情绪可以被一点点修复，而不是靠一次彻底的改变。你在意的可能不是完美结局，而是困难出现以后，彼此是否还愿意留下来继续说。"
        : hasConnection
          ? "从故事望向内心，你似乎对人与人之间细微的许可很敏感：什么时候靠近，什么时候等待，什么样的回应才算真正听见。连接对你而言也许不是热闹，而是一种稳定的在场。"
          : "从故事望向内心，你似乎习惯借由想象与行动整理感受。比起直接给情绪下定义，你更愿意先让角色走一段路，再从它的选择里看见自己。",
      fairyTaleSummary: hasRepair
        ? "这不像一个关于胜利的故事，更像一个关于修好、靠近和继续讲下去的故事。"
        : `这次童话留下的痕迹，是你把“${storyText.slice(0, 18)}${storyText.length > 18 ? "……" : ""}”这样的片段认真收好，再轻轻交给朋友。`,
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

  function preloadImage(url) {
    if (!url || preloadedImages.has(url)) return;
    preloadedImages.add(url);
    const image = new Image();
    image.decoding = "async";
    image.src = url;
  }

  function preloadFloorAssets(floorNumber) {
    if (floorNumber < 1 || floorNumber > 5) return;
    preloadImage(`${assetBase}/01_backgrounds/bg_stair_${floorNumber}f.webp`);
  }

  async function queueIllustration(draft) {
    if (!draft || state.illustrations[draft.floor]?.status === "ready") return;
    const prompt = generateIllustrationPrompt(draft);
    state.illustrations[draft.floor] = { status: "generating", prompt, image: null };
    saveState();

    const configuredBase = String(window.FAIRYBOOK_API_BASE || "").replace(/\/$/, "");
    const hasSecureEndpoint = Boolean(configuredBase);
    if (!hasSecureEndpoint) {
      state.illustrations[draft.floor] = {
        status: "unavailable",
        prompt,
        image: null
      };
      saveState();
      return;
    }

    try {
      const response = await fetch(`${configuredBase}/api/illustration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: draft.userStory, selectedWords: draft.selectedWords })
      });
      if (!response.ok) throw new Error("illustration request failed");
      const data = await response.json();
      state.illustrations[draft.floor] = {
        status: data.image ? "ready" : "unavailable",
        prompt: data.prompt || prompt,
        image: data.image || null
      };
    } catch {
      state.illustrations[draft.floor] = { status: "failed", prompt, image: null };
    }
    saveState();
    if (state.screen === "book" && state.bookPage === draft.floor) render();
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
      state.drafts.length > 0
        ? `<button class="quiet-link" data-action="continue">继续上次的故事 <span aria-hidden="true">→</span></button>`
        : "";
    return `
      <section class="scene-shell start-scene art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_start_tower.webp')">
        <div class="scene-dim"></div>
        <header class="scene-masthead">
          <span>给我讲个故事</span>
          <span>一场写给朋友的童话</span>
        </header>
        <div class="start-copy">
          <p class="start-kicker">有个朋友住在顶楼。ta 不太常说话，只在每层楼留下一些词。今天，你可以把它们慢慢讲成一个故事。</p>
          <h1>给我讲个<br />故事</h1>
          <div class="start-actions">
            <button class="scene-link" data-action="intro">
              <span>开始上楼</span>
              <b aria-hidden="true">↗</b>
            </button>
            ${continueButton}
          </div>
        </div>
      </section>
    `;
  }

  function renderIntro() {
    return `
      <section class="scene-shell intro-scene art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_start_tower.webp')">
        <div class="scene-dim"></div>
        <header class="scene-masthead">
          <span>出发之前</span>
          <span>00 / 05</span>
        </header>
        <article class="intro-script">
          <p>你和朋友有一个秘密游戏。</p>
          <p>ta 在每层楼留下四种故事线索，<br />你把选中的词，讲进同一个故事里。</p>
          <p>不用写得很好。<br />像小时候那样讲，就可以。</p>
          <button class="scene-link" data-action="start-floor">
            <span>去第一层</span>
            <b aria-hidden="true">↓</b>
          </button>
        </article>
      </section>
    `;
  }

  function renderFloor() {
    const floor = currentFloor();
    const words = selectedWords();
    const missing = softMissingWords(words, state.story);
    const previousStory = state.drafts
      .filter((draft) => draft.floor < state.currentFloor)
      .sort((a, b) => a.floor - b.floor)
      .map((draft) => draft.userStory)
      .join(" ");
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
          <div class="word-line">
            <span class="word-line-label">${categoryLabels[category]}</span>
            <div class="word-line-options">${cards}</div>
            <button class="word-refresh" data-action="refresh-category" data-category="${category}" aria-label="换一组${categoryLabels[category]}" title="换一组${categoryLabels[category]}">↻</button>
          </div>
        `;
      })
      .join("");

    return `
      <section class="floor-shell art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_stair_${floor.floor}f.webp')">
        <div class="background-dim"></div>
        <header class="floor-hud">
          <span class="floor-number">0${floor.floor}</span>
          <div class="hud-right">
            <span>${state.drafts.length} / 5</span>
            <button class="hud-back" data-action="previous-step" ${
              state.currentFloor === 1 && state.phase !== "result" ? "disabled" : ""
            }>上一步</button>
            <button class="hud-reset" data-action="reset">重新开始</button>
          </div>
        </header>
        ${
          state.phase !== "result"
            ? `<div class="floor-narrative">
                <p class="story-whisper">${floor.prompt}</p>
                ${
                  previousStory
                    ? `<p class="story-so-far"><span>前文</span>${escapeHtml(previousStory)}</p>`
                    : ""
                }
              </div>`
            : ""
        }
        ${
          state.phase !== "result"
            ? `<section class="word-stage ${previousStory ? "has-history" : ""}" aria-label="词语选择">
                ${wordGroups}
                <p class="selection-count" aria-live="polite">已选 ${words.length} / ${categories.length}</p>
              </section>`
            : ""
        }
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
      <section class="story-composer" aria-label="输入故事">
        <div class="composer-selected">
          ${words.map((word) => `<span>${escapeHtml(word)}</span>`).join("")}
        </div>
        <div class="composer-entry">
          <label class="sr-only" for="story-input">写给朋友</label>
          <input id="story-input" type="text" value="${escapeHtml(state.story)}" placeholder="把这 4 个词讲进故事里。" autocomplete="off" />
          <button class="composer-random" data-action="random-story" title="根据已选词随机写一句">
            <span aria-hidden="true">↻</span>随机一句
          </button>
          <button class="composer-submit" data-action="submit-story" aria-label="讲给朋友听" title="讲给朋友听">
            <span aria-hidden="true">↑</span>
          </button>
        </div>
        ${tip}
        ${state.error ? `<p class="error-text">${escapeHtml(state.error)}</p>` : ""}
      </section>
    `;
  }

  function renderFeedbackOverlay(floor) {
    return `
      <section class="scene-response" aria-label="朋友反馈">
        <p>${floor.response.change}</p>
        <blockquote>${floor.response.line}</blockquote>
        <button class="response-link" data-action="next-floor">
          <span>${state.currentFloor >= 5 ? "装订童话书" : "继续上楼"}</span>
          <b aria-hidden="true">→</b>
        </button>
      </section>
    `;
  }

  function renderBook() {
    const page = state.bookPage || 0;
    const draft = state.drafts[page - 1];
    const illustration = draft ? state.illustrations[draft.floor] : null;
    const isCover = page === 0;
    const pageHtml = isCover
      ? `
        <p>这些故事被轻轻夹进纸页里，送给顶楼的朋友。</p>
      `
      : `
        <div class="book-illustration ${illustration?.image ? "has-image" : ""}" aria-label="故事插图" title="${escapeHtml(generateIllustrationPrompt(draft))}">
          ${
            illustration?.image
              ? `<img src="${illustration.image}" alt="根据第 ${draft.floor} 页故事生成的插图" />`
              : `<span>${
                  illustration?.status === "generating"
                    ? "正在为这段故事画一幅画"
                    : illustration?.status === "failed"
                      ? "插画生成失败"
                      : "插画服务未连接"
                }</span>`
          }
        </div>
        <div class="book-copy">
          <p class="book-page-index">第 ${draft.floor} 页</p>
          <p class="book-story-text">${escapeHtml(draft.userStory)}</p>
        </div>
      `;
    const image = isCover ? "book_cover.webp" : "book_page_template.webp";

    return `
      <section class="scene-shell book-scene art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_stair_5f.webp')">
        <div class="scene-dim"></div>
        <div class="book-layout">
          <div class="book-page art-backed" style="background-image: linear-gradient(90deg, rgba(181,138,98,0.12), transparent 36px), linear-gradient(rgba(255,253,244,0.72), rgba(255,253,244,0.72)), url('${assetBase}/05_book/${image}')">
            ${pageHtml}
          </div>
          <div class="book-controls">
            <button class="page-arrow" data-action="book-prev" aria-label="上一页" ${page === 0 ? "disabled" : ""}>←</button>
            <span>${page + 1} / 6</span>
            <button class="page-arrow" data-action="book-next" aria-label="下一页" ${page === 5 ? "disabled" : ""}>→</button>
          </div>
          <div class="book-actions">
            <button class="quiet-link" data-action="reset">重新开始</button>
            <button class="quiet-link" data-action="portrait">翻到最后一封信 <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </section>
    `;
  }

  function renderPortrait() {
    const portrait = state.portrait;
    const symbols = portrait.mainSymbols.map((symbol) => `<span>${escapeHtml(symbol)}</span>`).join("");
    return `
      <section class="scene-shell analysis-scene art-backed" style="background-image: url('${assetBase}/01_backgrounds/bg_stair_5f.webp')">
        <div class="scene-dim"></div>
        <section class="portrait-letter">
          <p class="letter-kicker">童话书里夹着的一封信</p>
          <h3>${escapeHtml(portrait.portraitName)}</h3>
          <div class="symbol-list">${symbols}</div>
          <div class="portrait-section"><h4>故事里留下的线索</h4><p>${escapeHtml(portrait.storyEvidence || "")}</p></div>
          <div class="portrait-section"><h4>情绪底色</h4><p>${escapeHtml(portrait.emotionalTone)}</p></div>
          <div class="portrait-section"><h4>靠近他人的方式</h4><p>${escapeHtml(portrait.relationshipPattern)}</p></div>
          <div class="portrait-section"><h4>面对困难的方式</h4><p>${escapeHtml(portrait.agencyPattern)}</p></div>
          <div class="portrait-section"><h4>安全感与潜在需要</h4><p>${escapeHtml(portrait.safetyAndNeed)}</p></div>
          <div class="portrait-section"><h4>从故事望向内心</h4><p>${escapeHtml(portrait.innerPortrait || portrait.fairyTaleSummary)}</p></div>
          <blockquote>${escapeHtml(portrait.fairyTaleSummary)}</blockquote>
          <strong>${escapeHtml(portrait.finalMessage)}</strong>
          <div class="button-row">
            <button class="quiet-link" data-action="back-book">← 回看童话书</button>
            <button class="quiet-link" data-action="reset">重新开始</button>
          </div>
        </section>
      </section>
    `;
  }

  function render() {
    if (
      state.screen === "floor" &&
      (!state.drawnCards.length ||
        (state.phase !== "result" && !state.drawnCards.some((item) => item.category === "subject")))
    ) {
      drawCardsForFloor(state.currentFloor);
    }
    if (state.screen === "floor") ensurePreviousWordCandidates();
    if (state.screen === "floor" && state.phase !== "result") ensureFiveWordOptions();

    preloadImage(`${assetBase}/01_backgrounds/bg_start_tower.webp`);
    if (state.screen === "floor") {
      preloadFloorAssets(state.currentFloor);
      preloadFloorAssets(state.currentFloor + 1);
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
          if (selectedWords().length === categories.length) {
            state.phase = "write";
          }
          saveState();
          render();
        }
        if (action === "refresh-category") refreshCategory(node.dataset.category);
        if (action === "close-input") {
          state.phase = "select";
          state.error = "";
          saveState();
          render();
        }
        if (action === "random-story") {
          state.story = generateRandomStorySentence();
          state.error = "";
          saveState();
          render();
        }
        if (action === "submit-story") submitStory();
        if (action === "next-floor") goNextFloor();
        if (action === "previous-step") goPreviousStep();
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
      window.requestAnimationFrame(() => input.focus());
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
