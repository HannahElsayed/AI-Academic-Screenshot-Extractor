import { NextRequest, NextResponse } from 'next/server';
import { validateImageFile } from '@/lib/validation/image-validator';
import { validateExtraction } from '@/lib/validation/validator';
import { getExtractionService } from '@/lib/gemini/service';
import type { ExtractionErrorCode, ExtractionResponse } from '@/types/academic';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse<ExtractionResponse>> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError('INVALID_MODEL_RESPONSE', 'Could not read the uploaded form data.', 400);
  }

  const file = formData.get('image');
  if (!file || !(file instanceof File)) {
    return jsonError('INVALID_FILE_TYPE', 'No image file was provided.', 400);
  }

  const imageValidation = validateImageFile({ size: file.size, type: file.type });
  if (!imageValidation.valid) {
    return jsonError(imageValidation.code, imageValidation.message, 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let service;
  try {
    service = getExtractionService();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction service is not configured.';
    return jsonError('UNKNOWN_ERROR', message, 500);
  }

  const result = await service.extractFromImage({ buffer, mimeType: file.type });

  if (!result.ok) {
    if (result.errorCode === 'RATE_LIMITED') {
      return jsonError(
        'GEMINI_RATE_LIMITED',
        "We're getting a lot of requests right now. Please wait a moment and try again.",
        429
      );
    }
    if (result.errorCode === 'INVALID_RESPONSE') {
      return jsonError(
        'INVALID_MODEL_RESPONSE',
        "We couldn't understand the AI's response for this screenshot. Please try again, or try a clearer image.",
        502
      );
    }
    return jsonError(
      'GEMINI_REQUEST_FAILED',
      'The AI extraction request failed. Please try again in a moment.',
      502
    );
  }

  const hasAnyCourses = result.data.semesters.some((s) => s.courses.length > 0);
  if (result.data.semesters.length === 0 || !hasAnyCourses) {
    return NextResponse.json<ExtractionResponse>(
      {
        success: false,
        data: result.data,
        error: {
          code: 'EMPTY_EXTRACTION',
          message:
            "We couldn't find any academic tables in this screenshot. Please review the image and try again, or add courses manually.",
        },
      },
      { status: 200 }
    );
  }

  const validationIssues = validateExtraction(result.data);

  return NextResponse.json<ExtractionResponse>({
    success: true,
    data: result.data,
    validationIssues,
  });
}

function jsonError(
  code: ExtractionErrorCode,
  message: string,
  status: number
): NextResponse<ExtractionResponse> {
  return NextResponse.json<ExtractionResponse>({ success: false, error: { code, message } }, { status });
}
