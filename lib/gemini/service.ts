import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXTRACTION_SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import { rawExtractionSchema } from './schema';
import type { RawExtractionResult } from '@/types/academic';

export interface AcademicExtractionService {
  extractFromImage(input: ExtractionInput): Promise<ExtractionServiceResult>;
}

export interface ExtractionInput {
  /** Raw image bytes. */
  buffer: Buffer;
  /** e.g. "image/png", "image/jpeg", "image/webp" */
  mimeType: string;
}

export type ExtractionServiceResult =
  | { ok: true; data: RawExtractionResult }
  | { ok: false; errorCode: 'RATE_LIMITED' | 'REQUEST_FAILED' | 'INVALID_RESPONSE'; message: string };

const MODEL_NAME = 'gemini-3.6-flash';

class GeminiAcademicExtractionService implements AcademicExtractionService {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async extractFromImage(input: ExtractionInput): Promise<ExtractionServiceResult> {
    const model = this.client.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    let responseText: string;
    try {
      const result = await model.generateContent([
        {
          inlineData: {
            data: input.buffer.toString('base64'),
            mimeType: input.mimeType,
          },
        },
        { text: buildUserPrompt() },
      ]);
      responseText = result.response.text();
    } catch (err: unknown) {
  console.error('GEMINI API ERROR:', err);

  const message = err instanceof Error ? err.message : 'Unknown Gemini API error';

  console.error('GEMINI ERROR MESSAGE:', message);

  const isRateLimit = /rate.?limit|quota|429/i.test(message);

  return {
    ok: false,
    errorCode: isRateLimit ? 'RATE_LIMITED' : 'REQUEST_FAILED',
    message,
  };
}

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(stripCodeFences(responseText));
    } catch {
      return {
        ok: false,
        errorCode: 'INVALID_RESPONSE',
        message: 'Gemini did not return valid JSON.',
      };
    }

    const parseResult = rawExtractionSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      return {
        ok: false,
        errorCode: 'INVALID_RESPONSE',
        message: `Gemini response did not match the expected schema: ${parseResult.error.message}`,
      };
    }

    return { ok: true, data: normalizeParsed(parseResult.data) };
  }
}


function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch?.[1] ?? trimmed;
}


function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const cleaned = value.trim().replace(/,/g, '');
  if (cleaned === '') return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function normalizeParsed(parsed: ReturnType<typeof rawExtractionSchema.parse>): RawExtractionResult {
  return {
    student: {
      name: parsed.student?.name ?? null,
      student_id: parsed.student?.student_id ?? null,
    },
    semesters: (parsed.semesters ?? []).map((sem) => ({
      semester_name: sem.semester_name ?? '',
      semester_gpa: toNullableNumber(sem.semester_gpa),
      cumulative_gpa: toNullableNumber(sem.cumulative_gpa),
      total_credit_hours: toNullableNumber(sem.total_credit_hours),
      courses: (sem.courses ?? []).map((course) => ({
        course_code: course.course_code ?? '',
        previous_course_code: course.previous_course_code ?? null,
        course_name: course.course_name ?? '',
        grade: course.grade ?? '',
        grade_points: toNullableNumber(course.grade_points),
        credit_hours: toNullableNumber(course.credit_hours),
        quality_points: toNullableNumber(course.quality_points),
        confidence: course.confidence ?? null,
        warnings: course.warnings ?? [],
      })),
    })),
    overall: {
      cumulative_gpa: toNullableNumber(parsed.overall?.cumulative_gpa),
      total_credit_hours: toNullableNumber(parsed.overall?.total_credit_hours),
    },
  };
}

let cachedService: AcademicExtractionService | null = null;


export function getExtractionService(): AcademicExtractionService {
  if (cachedService) return cachedService;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your .env.local file (see .env.example).'
    );
  }

  cachedService = new GeminiAcademicExtractionService(apiKey);
  return cachedService;
}
