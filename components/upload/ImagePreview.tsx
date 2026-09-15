'use client';

interface ImagePreviewProps {
  file: File;
  previewUrl: string;
  onRemove: () => void;
  onExtract: () => void;
  disabled?: boolean;
}

export function ImagePreview({ file, previewUrl, onRemove, onExtract, disabled }: ImagePreviewProps) {
  return (
    <div className="border border-ink-100 bg-white">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-700">{file.name}</p>
          <p className="text-xs text-ink-400">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-sm font-medium text-ink-400 underline decoration-ink-200 underline-offset-4 hover:text-rust"
        >
          Remove
        </button>
      </div>
      <div className="max-h-[420px] overflow-auto bg-parchment/30 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="Uploaded grades screenshot" className="mx-auto max-w-full shadow-sm" />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-ink-100 px-4 py-3">
        <p className="text-xs text-ink-400">This screenshot will be sent to Gemini for reading.</p>
        <button
          type="button"
          onClick={onExtract}
          disabled={disabled}
          className="shrink-0 bg-ink-600 px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:bg-ink-200"
        >
          Extract Academic Data
        </button>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
