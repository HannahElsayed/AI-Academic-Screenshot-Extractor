import type { RawExtractionResult, ValidationIssue } from '@/types/academic';

const QUALITY_POINTS_TOLERANCE = 0.15;

/**
 * Validates extracted data against basic academic-record sanity rules.
 * Never mutates or "corrects" values — it only reports issues so the
 * editable preview can highlight them for the user to resolve.
 */
export function validateExtraction(data: RawExtractionResult): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (data.semesters.length === 0) {
    issues.push({
      path: 'semesters',
      message: 'No semesters were found in this screenshot.',
      severity: 'warning',
    });
  }

  data.semesters.forEach((semester, semesterIndex) => {
    const semesterPath = `semesters[${semesterIndex}]`;

    if (!semester.semester_name.trim()) {
      issues.push({
        path: `${semesterPath}.semester_name`,
        message: 'Semester name is missing.',
        severity: 'warning',
      });
    }

    if (semester.semester_gpa !== null && !isPlausibleGpa(semester.semester_gpa)) {
      issues.push({
        path: `${semesterPath}.semester_gpa`,
        message: `Semester GPA (${semester.semester_gpa}) is outside the typical 0–4.0/5.0 range — please verify.`,
        severity: 'warning',
      });
    }

    if (semester.courses.length === 0) {
      issues.push({
        path: `${semesterPath}.courses`,
        message: 'No courses were found for this semester.',
        severity: 'warning',
      });
    }

    semester.courses.forEach((course, courseIndex) => {
      const coursePath = `${semesterPath}.courses[${courseIndex}]`;

      if (!course.course_code.trim()) {
        issues.push({
          path: `${coursePath}.course_code`,
          message: 'Course code is missing.',
          severity: 'warning',
        });
      }

      if (!course.course_name.trim()) {
        issues.push({
          path: `${coursePath}.course_name`,
          message: 'Course name is missing.',
          severity: 'warning',
        });
      }

      if (!course.grade.trim()) {
        issues.push({
          path: `${coursePath}.grade`,
          message: 'Grade is missing.',
          severity: 'warning',
        });
      }

      // quality_points ≈ grade_points × credit_hours, where all three are present
      if (
        course.grade_points !== null &&
        course.credit_hours !== null &&
        course.quality_points !== null
      ) {
        const expected = course.grade_points * course.credit_hours;
        const diff = Math.abs(expected - course.quality_points);
        const allowedDiff = Math.max(QUALITY_POINTS_TOLERANCE, expected * 0.05);
        if (diff > allowedDiff) {
          issues.push({
            path: `${coursePath}.quality_points`,
            message: `Quality points (${course.quality_points}) don't match grade points × credit hours (≈${round(expected)}). The extracted value was kept as-is — please verify.`,
            severity: 'warning',
          });
        }
      }

      if (course.confidence !== null && course.confidence < 0.75) {
        issues.push({
          path: `${coursePath}`,
          message: `Low extraction confidence (${Math.round(course.confidence * 100)}%) for this course row.`,
          severity: 'warning',
        });
      }

      for (const warning of course.warnings) {
        issues.push({ path: coursePath, message: warning, severity: 'warning' });
      }
    });
  });

  if (data.overall.cumulative_gpa !== null && !isPlausibleGpa(data.overall.cumulative_gpa)) {
    issues.push({
      path: 'overall.cumulative_gpa',
      message: `Overall cumulative GPA (${data.overall.cumulative_gpa}) is outside the typical range — please verify.`,
      severity: 'warning',
    });
  }

  return issues;
}

function isPlausibleGpa(gpa: number): boolean {
  return gpa >= 0 && gpa <= 5.0;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
