/**
 * Calculates the correct streak count based on weekly attendance patterns
 *
 * @param currentWeekAttendances Number of attendances in the current week
 * @param hadStreakLastWeek Whether the user had a streak last week (3+ attendances)
 * @param currentStreak The user's current streak count
 * @param isCurrentWeekComplete Whether the current week is complete
 * @returns The updated streak count
 */
export function calculateStreak(
  currentWeekAttendances: number,
  hadStreakLastWeek: boolean,
  currentStreak = 0,
  isCurrentWeekComplete = false,
): number {
  // Only update the streak once the week is complete
  if (!isCurrentWeekComplete) {
    return currentStreak
  }

  // User needs at least 3 attendances this week to maintain/start a streak
  const hasThreeAttendancesThisWeek = currentWeekAttendances >= 3

  if (hasThreeAttendancesThisWeek) {
    if (hadStreakLastWeek) {
      // Continue the streak
      return currentStreak + 1
    } else {
      // Start a new streak
      return 1
    }
  } else {
    // Didn't meet 3 attendances, streak breaks
    return 0
  }
}
