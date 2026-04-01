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
    date?: Date;
    hour?: number;
    minute?: number;
    repeats?: boolean;
    repeatType?: 'daily' | 'weekdays' | 'weekends' | 'custom';
    customDays?: number[]; // 0=Sun,1=Mon,...,6=Sat
  };
  sound: string; // preset sound name
}
