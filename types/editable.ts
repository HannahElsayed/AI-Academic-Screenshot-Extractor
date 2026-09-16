import type { ExtractedCourse, ExtractedSemester, ExtractedStudent, RawExtractionResult } from './academic';

export interface EditableCourse extends ExtractedCourse {
  uiId: string;
}

export interface EditableSemester extends Omit<ExtractedSemester, 'courses'> {
  uiId: string;
  courses: EditableCourse[];
}

export interface EditableExtraction {
  student: ExtractedStudent;
  semesters: EditableSemester[];
  overall: RawExtractionResult['overall'];
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function toEditable(data: RawExtractionResult): EditableExtraction {
  return {
    student: data.student,
    overall: data.overall,
    semesters: data.semesters.map((sem) => ({
      ...sem,
      uiId: makeId(),
      courses: sem.courses.map((course) => ({ ...course, uiId: makeId() })),
    })),
  };
}

export function toRaw(data: EditableExtraction): RawExtractionResult {
  return {
    student: data.student,
    overall: data.overall,
    semesters: data.semesters.map(({ uiId: _uiId, courses, ...sem }) => ({
      ...sem,
      courses: courses.map(({ uiId: _courseUiId, ...course }) => course),
    })),
  };
}

export function emptyCourse(): EditableCourse {
  return {
    uiId: makeId(),
    course_code: '',
    previous_course_code: null,
    course_name: '',
    grade: '',
    grade_points: null,
    credit_hours: null,
    quality_points: null,
    confidence: null,
    warnings: [],
  };
}

export function emptySemester(index: number): EditableSemester {
  return {
    uiId: makeId(),
    semester_name: `Semester ${index + 1}`,
    semester_gpa: null,
    cumulative_gpa: null,
    total_credit_hours: null,
    courses: [emptyCourse()],
  };
}
