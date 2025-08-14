// src/mock/scene.data.ts
import type { Scene } from '@/types/scene';

// 创建5条数据，以匹配参考图中的分页效果
export const sceneList: Scene[] = [
  {
    id: 1,
    name: '智慧空间',
    imageUrl: 'https://i.imgur.com/gTz2p28.png', // 使用更贴切的占位图
    isSelected: true,
  },
  {
    id: 2,
    name: '医院大厅',
    imageUrl: 'https://i.imgur.com/gTz2p28.png',
    isSelected: false,
  },
  {
    id: 3,
    name: '诊室',
    imageUrl: 'https://i.imgur.com/gTz2p28.png',
    isSelected: false,
  },
  {
    id: 4,
    name: '康复中心',
    imageUrl: 'https://i.imgur.com/gTz2p28.png',
    isSelected: false,
  },
    {
    id: 5,
    name: '户外广场',
    imageUrl: 'https://i.imgur.com/gTz2p28.png',
    isSelected: false,
  },
];