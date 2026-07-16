# 《顶楼的童话书》美术素材结构

两小时黑客松先保证「一眼有记忆点」：蓝绿色高楼、5 层楼梯状态、词卡贴纸、最终童话书。

## 推荐文件夹

素材统一放在 `public/art_assets`：

```text
public/art_assets/
  00_reference/
  01_backgrounds/
  02_characters/
  03_props/
  04_ui/
  05_book/
  06_share/
  07_video_optional/
```

## 必做素材

| 优先级 | 文件路径 | 用途 | 建议尺寸 |
| --- | --- | --- | --- |
| P0 | `01_backgrounds/bg_start_tower.png` | 开始页蓝绿色高楼，顶楼亮窗 | 1920x1080 |
| P0 | `01_backgrounds/bg_stair_1f.png` | 1F 门缝、蓝色贴纸、蜡笔字 | 1920x1080 |
| P0 | `01_backgrounds/bg_stair_2f.png` | 2F 小灯亮起、星星贴纸 | 1920x1080 |
| P0 | `01_backgrounds/bg_stair_3f.png` | 3F 小雨、纸船、低落但不压抑 | 1920x1080 |
| P0 | `01_backgrounds/bg_stair_4f.png` | 4F 纸飞机、发光植物、转折感 | 1920x1080 |
| P0 | `01_backgrounds/bg_stair_5f.png` | 5F 顶楼门、亮窗、朋友伸手 | 1920x1080 |
| P0 | `03_props/prop_word_card_set.png` | 词卡通用底图或九宫格贴纸 | 2048x2048 |
| P0 | `05_book/book_cover.png` | 最终童话书封面 | 1600x1200 |
| P0 | `05_book/book_page_template.png` | 最终故事页模板 | 1600x1200 |

## 加分素材

| 优先级 | 文件路径 | 用途 | 建议尺寸 |
| --- | --- | --- | --- |
| P1 | `02_characters/child_back.png` | 主角背影：背剑、抱空白书 | 1024x1024 |
| P1 | `02_characters/friend_silhouette.png` | 顶楼朋友剪影/门后半身 | 1024x1024 |
| P1 | `03_props/prop_blue_sticker.png` | 1F 回应贴纸 | 512x512 |
| P1 | `03_props/prop_little_lamp.png` | 2F 小灯 | 512x512 |
| P1 | `03_props/prop_paper_boat.png` | 3F 纸船 | 512x512 |
| P1 | `03_props/prop_paper_plane.png` | 4F 纸飞机 | 512x512 |
| P1 | `03_props/prop_glowing_plant.png` | 4F 发光植物 | 512x512 |
| P1 | `03_props/prop_star_sticker.png` | 星星贴纸 | 512x512 |
| P1 | `04_ui/ui_button_label.png` | 蜡笔标签按钮纹理 | 768x256 |
| P1 | `06_share/share_card_template.png` | 画像分享卡模板 | 1080x1350 |

## 可选视频

| 优先级 | 文件路径 | 用途 | 时长 |
| --- | --- | --- | --- |
| P2 | `07_video_optional/loop_start_tower.mp4` | 开始页高楼轻微动效 | 4-6s loop |
| P2 | `07_video_optional/anim_paper_plane.mp4` | 4F 纸飞机飞回 | 2-3s |
| P2 | `07_video_optional/anim_book_flip.mp4` | 童话书翻页 | 2-3s |
| P2 | `07_video_optional/anim_top_door_open.mp4` | 结尾门打开、亮窗 | 3-5s |

## 当前前端已接入的素材

- `01_backgrounds/bg_start_tower.png`
- `01_backgrounds/bg_stair_1f.png`
- `01_backgrounds/bg_stair_2f.png`
- `01_backgrounds/bg_stair_3f.png`
- `01_backgrounds/bg_stair_4f.png`
- `01_backgrounds/bg_stair_5f.png`
- `05_book/book_cover.png`
- `05_book/book_page_template.png`

这些图片不存在时，页面会显示 CSS 占位背景；图片补上后会自动生效。

## 风格统一提示词核心

```text
儿童绘本风、蜡笔质感、纸张纹理、轻微不规则线条、蓝绿色高楼、柔软安静、温柔但不甜腻、不过分精致、像孩子画出的楼梯间和童话书。
```
