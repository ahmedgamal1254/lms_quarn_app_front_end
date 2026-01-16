import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export async function requestFcmToken() {
  if (!messaging) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  return token;
}
