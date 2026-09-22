import { SemesterConfig } from "@/types";

export const INITIAL_SEMESTERS: SemesterConfig[] = [
  {
    id: "sem-2025-fall",
    name: "Fall 2025",
    startDate: "2025-09-01T00:00:00.000Z",
    endDate: "2026-01-31T23:59:59.000Z",
    isCurrent: false,
  },
  {
    id: "sem-2026-spring",
    name: "Spring 2026",
    startDate: "2026-02-01T00:00:00.000Z",
    endDate: "2026-06-30T23:59:59.000Z",
    isCurrent: true,
  },
];
