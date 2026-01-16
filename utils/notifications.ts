
export function notificationRoute(notification: any) {
  const { type, session_id } = notification?.data || {};

  switch (type) {
    case "session_created":
      return session_id ? `sessions/${session_id}` : "/sessions";

    default:
      return "/notifications";
  }
}