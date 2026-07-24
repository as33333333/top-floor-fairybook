import type { FloorConfig } from "@/types/game";

export const floors: FloorConfig[] = [
  {
    floor: 1,
    stage: "开始",
    title: "故事开始了",
    prompt: "朋友把几张词卡放在第一层的门口。请选择 3 个词，作为故事的开头。",
    helper: "故事里可以出现一个小角色，ta 准备去某个地方，或者发现了一件奇怪的小事。",
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
    response: {
      change: "顶楼窗户亮起，门慢慢打开。朋友伸出手，接过童话书。",
      line: "我一直都在听。"
    }
  }
];
