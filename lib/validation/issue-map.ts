import type { ValidationIssue } from '@/types/academic';

const PATH_PATTERN = /^semesters\[(\d+)\](?:\.courses\[(\d+)\](?:\.(\w+))?|\.(\w+))?$/;

export interface IndexedIssues {
  /** Issues for a specific field, e.g. "0:2:quality_points" */
  byField: Map<string, string[]>;
  /** Issues for a whole course row that aren't tied to one field, e.g. "0:2" */
  byCourse: Map<string, string[]>;
  /** Issues for a whole semester that aren't tied to one field, e.g. "0" */
  bySemester: Map<string, string[]>;
  general: string[];
}

export function indexValidationIssues(issues: ValidationIssue[] | undefined): IndexedIssues {
  const byField = new Map<string, string[]>();
  const byCourse = new Map<string, string[]>();
  const bySemester = new Map<string, string[]>();
  const general: string[] = [];

  for (const issue of issues ?? []) {
    const match = issue.path.match(PATH_PATTERN);
    if (!match) {
      general.push(issue.message);
      continue;
    }
    const [, semesterIdx, courseIdx, courseField, semesterField] = match;
    if (semesterIdx === undefined) {
      general.push(issue.message);
      continue;
    }

    if (courseIdx !== undefined && courseField) {
      pushTo(byField, `${semesterIdx}:${courseIdx}:${courseField}`, issue.message);
    } else if (courseIdx !== undefined) {
      pushTo(byCourse, `${semesterIdx}:${courseIdx}`, issue.message);
    } else if (semesterField) {
      pushTo(byField, `${semesterIdx}:${semesterField}`, issue.message);
    } else {
      pushTo(bySemester, semesterIdx, issue.message);
    }
  }

  return { byField, byCourse, bySemester, general };
}

function pushTo(map: Map<string, string[]>, key: string, message: string): void {
  const existing = map.get(key);
  if (existing) {
    existing.push(message);
  } else {
    map.set(key, [message]);
  }
}
