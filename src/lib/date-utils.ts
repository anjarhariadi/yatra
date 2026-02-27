export function getSaturdayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 6 ? 0 : 6 - day;
  const saturday = new Date(d);
  saturday.setDate(d.getDate() + diff);
  saturday.setHours(23, 59, 59, 999);
  return saturday;
}

export function getMonthEndDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function generateWeeklyPeriods(startDate: Date, endDate: Date): Date[] {
  const periods: Date[] = [];
  const start = getSaturdayOfWeek(startDate);
  const end = getSaturdayOfWeek(endDate);
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  const startMs = start.getTime();
  const endMs = end.getTime();

  for (let ms = startMs; ms <= endMs; ms += oneWeekMs) {
    periods.push(new Date(ms));
  }

  return periods;
}

export function generateMonthlyPeriods(startDate: Date, endDate: Date): Date[] {
  const periods: Date[] = [];
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  let currentYear = start.getFullYear();
  let currentMonth = start.getMonth();

  while (
    currentYear < end.getFullYear() ||
    (currentYear === end.getFullYear() && currentMonth <= end.getMonth())
  ) {
    periods.push(getMonthEndDate(new Date(currentYear, currentMonth, 1)));
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return periods;
}

export function findClosestRecord(
  records: { date: Date; amount: number; createdAt?: Date }[],
  targetDate: Date,
): number | null {
  const validRecords = records
    .filter((r) => r.date <= targetDate)
    .sort((a, b) => {
      const dateDiff = b.date.getTime() - a.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      if (a.createdAt && b.createdAt) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return 0;
    });

  if (validRecords.length === 0) {
    return null;
  }

  return validRecords[0].amount;
}
