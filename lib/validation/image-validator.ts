export const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; code: 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'EMPTY_FILE'; message: string };

export function validateImageFile(file: { size: number; type: string }): ImageValidationResult {
  if (!file.size || file.size === 0) {
    return { valid: false, code: 'EMPTY_FILE', message: 'The uploaded file is empty.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      message: `Image is too large. Please upload a screenshot under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: 'Unsupported file format. Please upload a PNG, JPG, or WebP screenshot.',
    };
  }

  return { valid: true };
}
