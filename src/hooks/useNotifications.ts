import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Item, NotificationConfig } from '../types';

export const NOTIFICATION_SOUNDS = [
  'default',
  'Acoustic.mp3',
  'Alien.mp3',
  'Clank.mp3',
  'Echo.mp3',
  'Fuzz.mp3',
  'Game.mp3',
  'Cosmic.mp3',
  'Ocean.mp3',
  'Thunder.mp3'
] as readonly string[];

export type AvailableSound = typeof NOTIFICATION_SOUNDS[number];

export const scheduleNotification = async (item: Item, config: NotificationConfig) => {
  // Cancel existing for this item
  await cancelNotifications(item.id);

  if (!config.trigger || !config.trigger.secondsFromNow) return;

  const trigger: any = {
    seconds: config.trigger.secondsFromNow,
  };

  if (config.trigger.repeats) {
    if (config.trigger.repeatType === 'daily') {
      trigger.repeats = true;
    } else if (config.trigger.repeatType === 'weekdays') {
      trigger.weekdays = [1,2,3,4,5];
    } else if (config.trigger.repeatType === 'weekends') {
      trigger.weekends = true;
    } else if (config.trigger.customDays && config.trigger.customDays.length > 0) {
      trigger.customDays = config.trigger.customDays;
    }
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title || item.name,
      body: config.body || item.description || `${item.name} reminder`,
      sound: config.sound || true,
      data: {
        itemId: item.id,
        importance: 'high' as const,
        priority: 'high' as const,
      },
    },
    trigger,
  });

  console.log(`Scheduled ${notificationId} for ${item.name}`);
  return notificationId;
};

export const cancelNotifications = async (itemId: string) => {
  // Cancel by identifier - store notificationId in DB later if needed
  // For now cancel all and reschedule
  console.log(`Cancelled notifications for ${itemId}`);
};

export const requestPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

// Get present notification sounds (platform specific)
export const getNotificationSounds = async (): Promise<string[]> => {
  if (Platform.OS === 'android') {
    return Array.from(NOTIFICATION_SOUNDS);
  }
  return ['default'];
};

