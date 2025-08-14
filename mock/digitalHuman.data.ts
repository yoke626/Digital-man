// src/mock/digitalHuman.data.ts
import type { DigitalHuman } from '@/types/digitalHuman';

// 为 DigitalHuman 类型增加一个 isDefault 字段
declare module '@/types/digitalHuman' {
  interface DigitalHuman {
    isDefault?: boolean;
  }
}

export const digitalHumanList: DigitalHuman[] = [
  {
    id: 1,
    name: '小江医生',
    status: 'ENABLED',
    avatarUrl: 'https://i.pravatar.cc/300?u=1', // 使用更稳定的占位图
    isDefault: true, // --- 新增：标记为默认数字人 ---
  },
  {
    id: 2,
    name: '小新医生',
    status: 'DISABLED',
    avatarUrl: 'https://i.pravatar.cc/300?u=2',
    isDefault: false,
  },
  {
    id: 3,
    name: '小李护士',
    status: 'DISABLED',
    avatarUrl: 'https://i.pravatar.cc/300?u=3',
    isDefault: false,
  },
  {
    id: 4,
    name: '智能导诊员',
    status: 'DISABLED',
    avatarUrl: 'https://i.pravatar.cc/300?u=4',
    isDefault: false,
  },
  // --- 新增的数据 ---
  { id: 5, name: '张教授', status: 'DISABLED', avatarUrl: 'https://i.pravatar.cc/300?u=5', isDefault: false },
  { id: 6, name: '刘医生', status: 'DISABLED', avatarUrl: 'https://i.pravatar.cc/300?u=6', isDefault: false },
];