/**
 * Utility functions for refreshing data across components
 */

/**
 * Triggers a refresh of the global attendance feed
 */
export function refreshGlobalFeed() {
    if (typeof window !== "undefined") {
      // Create a custom event that the global tab can listen for
      const event = new CustomEvent("attendance-visibility-changed")
      window.dispatchEvent(event)
    }
  }
  
  /**
   * Triggers a refresh of the friends attendance feed
   */
  export function refreshFriendsFeed() {
    if (typeof window !== "undefined") {
      // Create a custom event that the friends tab can listen for
      const event = new CustomEvent("friends-attendance-changed")
      window.dispatchEvent(event)
    }
  }
  
  