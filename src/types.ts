export interface Item {
  id: string;
  parentId: string | null;
  type: 'checklist' | 'static';
  name: string;
  description?: string | null;
  color?: string | null;
  completed: boolean;
  createdAt: number;
  notifications: NotificationConfig[];
}

export interface NotificationConfig {
  id: string;
  title: string;
  body: string;
  trigger: {
    hour?: number;
    minute?: number;
    repeats?: boolean;
    repeatType?: 'daily' | 'weekdays' | 'weekends' | 'custom';
    customDays?: number[]; // 0=Sun,1=Mon,...,6=Sat
    secondsFromNow?: number; // computed trigger
  };
  sound: string; // 'default', 'custom1.mp3' etc
}
