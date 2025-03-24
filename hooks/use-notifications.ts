"use client"

import { useState, useEffect } from "react"

// Define notification types
export interface Notification {
  id: string
  title: string
  description: string
  date: string // ISO string
}

// Current notifications to show
const CURRENT_NOTIFICATIONS: Notification[] = [
  {
    id: "navbar-update-2025",
    title: "New Navigation Experience!",
    description:
      "We've updated the bottom navigation bar and added a new 'Find Buddy' tab to help you connect with gym partners.",
    date: "2025-03-24T00:00:00Z",
  },
  // Add future notifications here
]

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load seen notifications from localStorage
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    try {
      // Get seen notification IDs from localStorage
      const seenNotificationsJSON = localStorage.getItem("seen_notifications")
      const seenNotifications: string[] = seenNotificationsJSON ? JSON.parse(seenNotificationsJSON) : []

      // Filter out notifications that have already been seen
      const unseenNotifications = CURRENT_NOTIFICATIONS.filter(
        (notification) => !seenNotifications.includes(notification.id),
      )

      setNotifications(unseenNotifications)

      // Set the first unseen notification as active
      if (unseenNotifications.length > 0) {
        setActiveNotification(unseenNotifications[0])
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Mark a notification as seen
  const markAsSeen = (notificationId: string) => {
    try {
      // Get current seen notifications
      const seenNotificationsJSON = localStorage.getItem("seen_notifications")
      const seenNotifications: string[] = seenNotificationsJSON ? JSON.parse(seenNotificationsJSON) : []

      // Add this notification ID if not already included
      if (!seenNotifications.includes(notificationId)) {
        seenNotifications.push(notificationId)
        localStorage.setItem("seen_notifications", JSON.stringify(seenNotifications))
      }

      // Update state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      setActiveNotification(null)
    } catch (error) {
      console.error("Error marking notification as seen:", error)
    }
  }

  // Dismiss the current notification
  const dismissNotification = () => {
    if (activeNotification) {
      markAsSeen(activeNotification.id)
    }
  }

  return {
    notifications,
    activeNotification,
    isLoaded,
    dismissNotification,
    markAsSeen,
  }
}

