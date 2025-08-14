// src/types/scene.d.ts

export interface Scene {
  id: number;
  name: string;
  sceneUrl: string; // 核心修正：将 imageUrl 修改为 sceneUrl [cite: 163]
  isSelected: boolean; 
}