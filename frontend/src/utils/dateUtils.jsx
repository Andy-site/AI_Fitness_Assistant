/**
 * Get the start date of a specific week number in a month.
 * Assumes weeks start on Sunday.
 * 
 * @param {number} year - Full year, e.g. 2025
 * @param {number} month - 0-based month (0 = Jan, 1 = Feb, ...)
 * @param {number} weekNumber - 1-based week number in the month
 * @returns {Date} - Date object for the start of that week
 */
export function getStartDateOfMonthWeek(year, month, weekNumber) {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0=Sun,1=Mon,...

  // Calculate offset to first Sunday (start of week)
  const firstSundayOffset = (7 - firstDayWeekday) % 7;

  if (weekNumber === 1) {
    // Week 1 starts on the 1st of the month
    return firstDayOfMonth;
  } else {
    // Week 2+ starts after firstSundayOffset + (weekNumber-2)*7 days
    const day = 1 + firstSundayOffset + (weekNumber - 2) * 7;
    return new Date(year, month, day);
  }
}
