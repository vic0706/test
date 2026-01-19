import { AppData, RaceCategory, RaceRecord, SpeedTestItem, TrainingRecord } from '../types';

const STORAGE_KEY = 'louie_racing_data_v1';

const DEFAULT_ITEMS: SpeedTestItem[] = [
  { id: '10m', name: '10m 測速', isDefault: true },
  { id: '30m', name: '30m 測速', isDefault: true },
  { id: 'pump', name: '波浪道單圈', isDefault: false },
];

// Helper to generate random data
const generateMockData = (): AppData => {
  const training: TrainingRecord[] = [];
  const items = DEFAULT_ITEMS;
  
  // Generate 50-100 days of data
  const daysBack = 60;
  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Randomly decide if trained this day (70% chance)
    if (Math.random() > 0.3) {
      // 10m Records (10-20 laps)
      const laps10m = Math.floor(Math.random() * 10) + 10;
      for (let j = 0; j < laps10m; j++) {
        // Base time around 4.5s, random variation
        const seconds = 4.2 + Math.random() * 1.5;
        training.push({
          id: `t-${dateStr}-10m-${j}`,
          timestamp: date.getTime() + j * 60000,
          dateStr,
          itemId: '10m',
          itemName: '10m 測速',
          seconds: Number(seconds.toFixed(4))
        });
      }

      // 30m Records (5-15 laps)
      const laps30m = Math.floor(Math.random() * 10) + 5;
      for (let j = 0; j < laps30m; j++) {
        // Base time around 12s
        const seconds = 11.5 + Math.random() * 2.5;
        training.push({
          id: `t-${dateStr}-30m-${j}`,
          timestamp: date.getTime() + j * 120000 + 3600000, // 1 hour later
          dateStr,
          itemId: '30m',
          itemName: '30m 測速',
          seconds: Number(seconds.toFixed(4))
        });
      }
    }
  }

  const races: RaceRecord[] = [
    {
      id: 'r1',
      date: '2023-12-15',
      name: '聖誕盃滑步車大賽',
      category: RaceCategory.SPRINT,
      rank: '冠軍',
      isUpcoming: false
    },
    {
      id: 'r2',
      date: '2024-01-20',
      name: '新年極速挑戰賽',
      category: RaceCategory.PUMP_TRACK,
      rank: '季軍',
      isUpcoming: false
    },
    {
      id: 'r3',
      date: '2024-02-10',
      name: '春季聯賽',
      category: RaceCategory.SPRINT,
      rank: '第5名',
      isUpcoming: false
    },
    {
      id: 'r_future_1',
      date: '2024-06-15',
      name: '全國菁英盃',
      category: RaceCategory.SPRINT,
      rank: '',
      isUpcoming: true
    },
    {
      id: 'r_future_2',
      date: '2024-07-01',
      name: '暑期大獎賽',
      category: RaceCategory.OBSTACLE,
      rank: '',
      isUpcoming: true
    }
  ];

  return {
    items,
    training: training.sort((a, b) => b.timestamp - a.timestamp),
    races: races.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
};

export const getAppData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Simple migration check (if needed in future)
      if (!parsed.items) return generateMockData();
      return parsed;
    } catch (e) {
      console.error("Data parse error", e);
      return generateMockData();
    }
  }
  const initial = generateMockData();
  saveAppData(initial);
  return initial;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};