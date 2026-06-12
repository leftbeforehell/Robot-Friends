import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function formatHour(date: Date): string {
  const h = date.getHours();
  const min = date.getMinutes().toString().padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${min} ${period}`;
}

function getNotificationCopy(hour: number, timeStr: string): { title: string; body: string } {
  const title = 'TYME';

  if (hour >= 0 && hour < 5) {
    const lines = [
      `IT'S ${timeStr}. STILL UP?`,
      `${timeStr}. YOU SHOULD BE SLEEPING.`,
      `THE CLOCK READS ${timeStr}. JUST SO YOU KNOW.`,
    ];
    return { title, body: lines[hour % lines.length] };
  }

  if (hour >= 5 && hour < 8) {
    const lines = [
      `MORNING. IT'S ${timeStr}.`,
      `${timeStr}. THE DAY BEGINS.`,
      `EARLY. IT'S ${timeStr}.`,
    ];
    return { title, body: lines[hour % lines.length] };
  }

  if (hour >= 8 && hour < 12) {
    const lines = [
      `IT'S ${timeStr}. GET TO WORK.`,
      `${timeStr}. THE DAY IS YOUNG.`,
      `${timeStr}. STILL MORNING.`,
      `IT IS ${timeStr}. FOCUS.`,
    ];
    return { title, body: lines[hour % lines.length] };
  }

  if (hour === 12) {
    return { title, body: `IT'S NOON. 12:00 PM.` };
  }

  if (hour >= 13 && hour < 17) {
    const lines = [
      `${timeStr}. THE AFTERNOON CONTINUES.`,
      `IT'S ${timeStr}.`,
      `${timeStr}. STILL GOING.`,
      `THE TIME IS ${timeStr}.`,
    ];
    return { title, body: lines[hour % lines.length] };
  }

  if (hour >= 17 && hour < 20) {
    const lines = [
      `EVENING. IT'S ${timeStr}.`,
      `${timeStr}. DAY'S WINDING DOWN.`,
      `IT'S ${timeStr}. ALMOST DONE.`,
    ];
    return { title, body: lines[hour % lines.length] };
  }

  const lines = [
    `${timeStr}. NEARLY MIDNIGHT.`,
    `IT'S ${timeStr}. WIND DOWN.`,
    `${timeStr}. THE DAY IS ENDING.`,
    `LATE. IT'S ${timeStr}.`,
  ];
  return { title, body: lines[hour % lines.length] };
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tyme-hourly', {
      name: 'Hourly Time Alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHourlyNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();

  for (let i = 1; i <= 24; i++) {
    const trigger = new Date(now);
    trigger.setMinutes(0, 0, 0);
    trigger.setHours(now.getHours() + i);

    const timeStr = formatHour(trigger);
    const { title, body } = getNotificationCopy(trigger.getHours(), timeStr);

    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
    });
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}
