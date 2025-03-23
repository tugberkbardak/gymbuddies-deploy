/**
 * Calculates the correct streak count based on weekly attendance patterns
 *
 * @param currentWeekAttendances Number of attendances in the current week
 * @param hadStreakLastWeek Whether the user had a streak last week
 * @param currentStreak The user's current streak count
 * @returns The updated streak count
 */
export function calculateStreak(currentWeekAttendances: number, hadStreakLastWeek: boolean, currentStreak = 0): number {
    // User needs at least 3 attendances this week to maintain/start a streak
    const hasThreeAttendancesThisWeek = currentWeekAttendances >= 3
  
    if (hasThreeAttendancesThisWeek) {
      if (hadStreakLastWeek) {
        // If they had a streak last week and qualified this week,
        // increment their streak count by 1 week
        return currentStreak + 1
      } else {
        // If they didn't have a streak last week but qualified this week,
        // start a new 1-week streak
        return 1
      }
    } else if (!hadStreakLastWeek) {
      // If they didn't have a streak last week and haven't qualified this week,
      // they have no streak
      return 0
    }
  
    // If they had a streak last week but haven't qualified yet this week,
    // maintain their current streak until the week ends
    return currentStreak
  }
  
  