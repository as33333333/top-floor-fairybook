# 给我讲个故事

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
4. 在部署平台的 Environment Variables / Secrets 面板添加环境变量：

```text
DASHSCOPE_API_KEY=你的百炼 API Key
DASHSCOPE_IMAGE_MODEL=wanx2.1-t2i-turbo
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/api/v1
```

本地开发时将这些变量写入项目根目录的 `.env.local`。该文件已被
`.gitignore` 排除，不能把真实 Key 写入 `.env.example`、`static/` 或任何前端文件。
不配置 `DASHSCOPE_API_KEY` 时，插画接口返回 fallback；画像继续使用本地 fallback。

如需使用 OpenAI 生成画像，可另外在服务端配置：

```text
OPENAI_API_KEY=你的 OpenAI Key
OPENAI_MODEL=gpt-4.1-mini
```

静态版会在玩家每层提交故事后立即创建插画任务。若已部署安全的 Next.js API，
在 `static/config.js` 中填写服务地址即可：

```js
window.FAIRYBOOK_API_BASE = "https://你的-api-域名";
```

密钥只配置在服务端，不能写入 `static/`。

## 当前 MVP

- 开始页
- 剧情引导页
- 5 层楼流程
- 每层展示 20 张词卡（主体、意象、情绪、行动各 5 张）
- 后续楼层的四类词语都会保留此前选择过的不同词语，并用当前层词库补足 5 个候选
- 每类词卡选择 1 张
- 每组词可独立刷新
- 故事输入与温柔校验
- 自动串联展示前文
- 朋友回应
- 最终童话书与逐层预生成插画任务
- 基于故事证据的非诊断式心理画像
- localStorage 进度保存
- 重新开始

## 素材协作

图片素材放在 `public/art_assets`，按 `00_reference` 到 `07_video_optional` 分文件夹管理。详见 `UI_ASSET_BRIEF.md`。
