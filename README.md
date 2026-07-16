# 顶楼的童话书

疗愈型网页叙事游戏 MVP。玩家逐层选择词卡、续写故事，最后生成童话书和非诊断式故事心理画像。

## 本地运行

当前仓库包含两个版本：

- `static/`：纯静态可运行版，不需要 npm，使用本地画像生成逻辑，适合黑客松现场兜底演示。
- `src/`：Next.js 版本，适合后续接入真实 AI API 和 Vercel 部署。

词库 JSON 放在 `static/data/words_floor_*.json`。静态版为了支持直接用 `file://` 打开，JS 内保留了一份同结构 fallback，避免本地 JSON fetch 被浏览器拦截。

### 静态版

直接打开：

```text
static/index.html
```

或启动本地静态服务：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/static/`。

### Next.js 版

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 部署

推荐 Vercel：

1. 把仓库推到 GitHub。
2. 在 Vercel 新建项目并导入仓库。
3. Framework 选择 Next.js。
4. 如需真实 AI 画像，添加环境变量：

```text
OPENAI_API_KEY=你的 key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1
```

不配置 `OPENAI_API_KEY` 也能完整演示，系统会使用本地 fallback 画像。

## 当前 MVP

- 开始页
- 剧情引导页
- 5 层楼流程
- 每层随机 9 张词卡
- 每类词卡选择 1 张
- 故事输入与温柔校验
- 朋友回应
- 最终童话书
- 故事心理画像
- localStorage 进度保存
- 重新开始

## 素材协作

图片素材放在 `public/art_assets`，按 `00_reference` 到 `07_video_optional` 分文件夹管理。详见 `UI_ASSET_BRIEF.md`。
