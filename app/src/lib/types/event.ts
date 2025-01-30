export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  instructor?: {
    name: string;
    role: string;
    image?: string;
    soundcloud?: string;
    instagram?: string;
  };
  icon?: string;
}

export interface Stage {
  name: string;
  description: string;
  schedule: ScheduleItem[];
}

export interface Day {
  date: string;
  stages: Stage[];
}