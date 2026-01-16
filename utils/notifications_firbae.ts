"use client";

import { useEffect } from "react";
import { messaging } from "@/utils/firebase";
import { onMessage } from "firebase/messaging";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function FirebaseNotificationsListener() {
      const queryClient = useQueryClient();
    
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("FCM Received:", payload);

      toast.success(payload?.notification?.body || "New Notification", {
        position: "bottom-right",
      })
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
