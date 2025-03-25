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
  // User needs at least 3 attendances this week to maintain/start a streak
  const hasThreeAttendancesThisWeek = currentWeekAttendances >= 3

  if (hasThreeAttendancesThisWeek) {
    if (hadStreakLastWeek) {
      // If they had a streak last week (3+ attendances) and qualified this week,
      // increment their streak count
      return currentStreak + 1
    } else {
      // If they didn't have a streak last week but qualified this week,
      // start a new 1-week streak
      return 1
    }
  } else {
    // If they don't have 3+ attendances this week
    if (isCurrentWeekComplete || !hadStreakLastWeek) {
      // If the current week is complete OR they didn't have a streak last week,
      // they have no streak
      return 0
    } else {
      // If the current week is not complete AND they had a streak last week,
      // we'll check if they had a streak in the previous week
      return hadStreakLastWeek ? currentStreak : 0
    }
  }
}

