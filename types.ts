export interface SpeedTestItem {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface TrainingRecord {
  id: string;
  timestamp: number; // Unix timestamp
  dateStr: string; // YYYY-MM-DD for grouping
  itemId: string; // Links to SpeedTestItem.id
  itemName: string; // Snapshot of name
  seconds: number;
  note?: string;
}

export enum RaceCategory {
  SPRINT = '個人競速',
  RELAY = '團體接力',
  OBSTACLE = '障礙賽',
  PUMP_TRACK = '波浪道',
  OTHER = '其他'
}

export interface RaceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  category: RaceCategory | string;
  rank: string; // e.g., "冠軍", "第5名", "小組賽"
  photoUrl?: string; // Base64 or URL
  isUpcoming: boolean;
}

export interface AppData {
  items: SpeedTestItem[];
  training: TrainingRecord[];
  races: RaceRecord[];
}