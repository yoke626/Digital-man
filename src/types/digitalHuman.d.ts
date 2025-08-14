// src/types/digitalHuman.d.ts
import type { Avatar } from './avatar'; // 引入Avatar类型

export interface DigitalHuman {
  id: number;
  name: string;
  status: 'ENABLED' | 'DISABLED';
  // 核心修改：avatar是一个对象，而不是简单的字符串
  avatar: Pick<Avatar, 'id' | 'name' | 'staticImageUrl'>;
  // 以下为表单和接口需要用到的字段
  avatarId?: number;
  enableModelFallback?: boolean;
  enableMultiTurnDialogue?: boolean;
}