
export enum ActivityType {
  WALKING = 'walking',
  RUNNING = 'running',
  HIKING = 'hiking'
}

export interface WalkRecord {
  id: string;
  date: string;
  distanceKm: number;
  steps: number;
  durationSeconds: number;
  avgSpeed: number;
  type: ActivityType; // Novo campo
  calories?: number;
}

export interface DailyGoal {
  steps: number;
  distance: number;
}

export enum Tab {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  GOALS = 'goals',
  PREMIUM = 'premium'
}

export interface GeolocationState {
  lat: number;
  lng: number;
}
