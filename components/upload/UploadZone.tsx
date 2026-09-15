'use client';

import { useCallback, useRef, useState } from 'react';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, validateImageFile } from '@/lib/validation/image-validator';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  errorMessage?: string | null;
}

export function UploadZone({ onFileSelected, errorMessage }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      const validation = validateImageFile({ size: file.size, type: file.type });
      if (!validation.valid) {
        setLocalError(validation.message);
        return;
      }
      setLocalError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const message = localError ?? errorMessage;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed px-8 py-16 text-center transition-colors ${
          isDragActive ? 'border-brass bg-brass-light/20' : 'border-ink-200 hover:border-brass hover:bg-parchment/40'
        }`}
      >
        <UploadGlyph active={isDragActive} />
        <div className="space-y-1.5">
          <p className="font-serif text-xl font-semibold text-ink-700">
            Drop your grades screenshot here
          </p>
          <p className="text-sm text-ink-400">
            or click to browse — PNG, JPG, or WebP, up to {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB
          </p>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-ink-400">
          The image is analyzed by AI to read the tables and pull out courses, grades, and GPA.
          Nothing is saved until you review and confirm it.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(',')}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {message && (
        <p className="mt-3 border-l-2 border-rust bg-rust-light px-3 py-2 text-sm text-rust" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

function UploadGlyph({ active }: { active: boolean }) {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      className={`transition-transform ${active ? 'scale-110' : ''}`}
      aria-hidden="true"
    >
      <rect x="4" y="8" width="44" height="36" rx="1" stroke="#8A6B3D" strokeWidth="1.5" />
      <path d="M4 34L17 22L27 32L36 24L48 34" stroke="#1B2A4A" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="18" cy="18" r="3.5" stroke="#B08D57" strokeWidth="1.5" />
    </svg>
  );
}
