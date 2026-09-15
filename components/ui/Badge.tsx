import type { ReactNode } from 'react';

type BadgeTone = 'warning' | 'success' | 'error' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  warning: 'bg-brass-light/40 text-brass-dark border-brass/60',
  success: 'bg-moss-light text-moss border-moss/40',
  error: 'bg-rust-light text-rust border-rust/40',
  neutral: 'bg-ink-50 text-ink-500 border-ink-100',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
