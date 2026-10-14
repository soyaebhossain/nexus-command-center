import { playChime } from './audio';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

export function sendLocalNotification(title: string, body: string, icon = '🔔') {
  playChime(920);
  setTimeout(() => playChime(1180), 180);

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        silent: false
      });
    } catch (e) {
      // Background notifications fallback
    }
  }
}
