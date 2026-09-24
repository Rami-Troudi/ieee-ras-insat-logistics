import { SemesterConfig } from "@/types";

export function buildSemesterConfigs(at = new Date()): SemesterConfig[] {
  const year = at.getUTCFullYear();
  const month = at.getUTCMonth() + 1;
  const isFall = month >= 9 || month === 1;
  const currentStartYear = month === 1 ? year - 1 : year;
  const springYear = isFall ? currentStartYear : year;
  const currentName = isFall ? `Fall ${currentStartYear}` : `Spring ${year}`;
  const currentStart = isFall ? `${currentStartYear}-09-01` : `${year}-02-01`;
  const currentEnd = isFall ? `${currentStartYear + 1}-01-31` : `${year}-08-31`;
  const previousName = isFall ? `Spring ${springYear}` : `Fall ${year - 1}`;
  const previousStart = isFall ? `${springYear}-02-01` : `${year - 1}-09-01`;
  const previousEnd = isFall ? `${springYear}-08-31` : `${year}-01-31`;

  return [
    {
      id: previousName.toLowerCase().replace(" ", "-"),
      name: previousName,
      startDate: `${previousStart}T00:00:00.000Z`,
      endDate: `${previousEnd}T23:59:59.999Z`,
      isCurrent: false,
    },
    {
      id: currentName.toLowerCase().replace(" ", "-"),
      name: currentName,
      startDate: `${currentStart}T00:00:00.000Z`,
      endDate: `${currentEnd}T23:59:59.999Z`,
      isCurrent: true,
    },
  ];
}

export const INITIAL_SEMESTERS = buildSemesterConfigs();
