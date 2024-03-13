export function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  const oneDayMs = 1000 * 60 * 60 * 24;
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const diffDays = Math.round((endMs - startMs) / oneDayMs);

  return diffDays;
}
