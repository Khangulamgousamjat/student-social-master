"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";

export function useFCM(vapidKey?: string) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    setPermission(Notification.permission);

    async function requestAndGetToken() {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);

        if (currentPermission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: vapidKey || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          if (token) {
            setFcmToken(token);
            console.log("FCM Registration Token:", token);
          }
        }
      } catch (err) {
        console.error("An error occurred while retrieving FCM token.", err);
      }
    }

    requestAndGetToken();

    // Listen for foreground push notifications
    let unsubscribe: (() => void) | undefined;
    getFirebaseMessaging().then((messaging) => {
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);
          if (payload.notification) {
            new Notification(payload.notification.title || "Student Social", {
              body: payload.notification.body,
              icon: "/favicon.ico",
            });
          }
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [vapidKey]);

  return { fcmToken, permission };
}
