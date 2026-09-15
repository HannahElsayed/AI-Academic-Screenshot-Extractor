/**
 * Domain types for the AI Academic Screenshot Data Extractor.
 *
 * These mirror the JSON schema Gemini is instructed to return. Anything the
 * model could not confidently read comes back as `null` rather than a
 * guessed value — see lib/gemini/schema.ts for the schema Gemini is given.
 */

export type Nullable<T> = T | null;

export interface ExtractedCourse {
  course_code: string;
  previous_course_code: Nullable<string>;
  course_name: string;
  grade: string;
  grade_points: Nullable<number>;
  credit_hours: Nullable<number>;
  quality_points: Nullable<number>;
  /** Model's self-reported confidence for this row, 0–1. */
  confidence: Nullable<number>;
  /** Human-readable notes about anything uncertain in this row. */
  warnings: string[];
}

export interface ExtractedSemester {
  semester_name: string;
  semester_gpa: Nullable<number>;
  cumulative_gpa: Nullable<number>;
  total_credit_hours: Nullable<number>;
  courses: ExtractedCourse[];
}

export interface ExtractedStudent {
  name: Nullable<string>;
  student_id: Nullable<string>;
}

export interface ExtractedOverall {
  cumulative_gpa: Nullable<number>;
  total_credit_hours: Nullable<number>;
}

/** The raw shape Gemini is asked to return. */
export interface RawExtractionResult {
  student: ExtractedStudent;
  semesters: ExtractedSemester[];
  overall: ExtractedOverall;
}

/** A row-level issue found during backend validation. */
export interface ValidationIssue {
  path: string;
  message: string;
  severity: 'warning' | 'error';
}

/** The result returned by the /api/extract route to the frontend. */
export interface ExtractionResponse {
  success: boolean;
  data?: RawExtractionResult;
  validationIssues?: ValidationIssue[];
  error?: {
    code: ExtractionErrorCode;
    message: string;
  };
}

export type ExtractionErrorCode =
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'EMPTY_FILE'
  | 'GEMINI_REQUEST_FAILED'
  | 'GEMINI_RATE_LIMITED'
  | 'INVALID_MODEL_RESPONSE'
  | 'EMPTY_EXTRACTION'
  | 'UNKNOWN_ERROR';

export interface SaveRequestPayload {
  data: RawExtractionResult;
}

export interface SaveResponse {
  success: boolean;
  recordId?: string;
  error?: string;
}
