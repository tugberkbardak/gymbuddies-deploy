"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { NotificationToast } from "@/components/notifications/notification-toast"

export function NotificationsProvider() {
  const { activeNotification, dismissNotification, isLoaded } = useNotifications()

  // Don't render anything until notifications are loaded
  if (!isLoaded) return null

  // Only render if there's an active notification
  if (!activeNotification) return null

  return <NotificationToast notification={activeNotification} onDismiss={dismissNotification} />
}

