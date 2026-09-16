import { z } from 'zod';



const nullableString = z.union([z.string(), z.null()]).optional().nullable();
const nullableNumberLike = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .nullable();

export const courseSchema = z.object({
  course_code: z.string().default(''),
  previous_course_code: nullableString,
  course_name: z.string().default(''),
  grade: z.string().default(''),
  grade_points: nullableNumberLike,
  credit_hours: nullableNumberLike,
  quality_points: nullableNumberLike,
  confidence: z.union([z.number(), z.null()]).optional().nullable(),
  warnings: z.array(z.string()).optional().default([]),
});

export const semesterSchema = z.object({
  semester_name: z.string().default(''),
  semester_gpa: nullableNumberLike,
  cumulative_gpa: nullableNumberLike,
  total_credit_hours: nullableNumberLike,
  courses: z.array(courseSchema).default([]),
});

export const rawExtractionSchema = z.object({
  student: z
    .object({
      name: nullableString,
      student_id: nullableString,
    })
    .default({ name: null, student_id: null }),
  semesters: z.array(semesterSchema).default([]),
  overall: z
    .object({
      cumulative_gpa: nullableNumberLike,
      total_credit_hours: nullableNumberLike,
    })
    .default({ cumulative_gpa: null, total_credit_hours: null }),
});

export type RawExtractionParsed = z.infer<typeof rawExtractionSchema>;

export const GEMINI_JSON_SCHEMA_DESCRIPTION = `{
  "student": {
    "name": string | null,
    "student_id": string | null
  },
  "semesters": [
    {
      "semester_name": string,
      "semester_gpa": number | null,
      "cumulative_gpa": number | null,
      "total_credit_hours": number | null,
      "courses": [
        {
          "course_code": string,
          "previous_course_code": string | null,
          "course_name": string,
          "grade": string,
          "grade_points": number | null,
          "credit_hours": number | null,
          "quality_points": number | null,
          "confidence": number | null,
          "warnings": string[]
        }
      ]
    }
  ],
  "overall": {
    "cumulative_gpa": number | null,
    "total_credit_hours": number | null
  }
}`;
