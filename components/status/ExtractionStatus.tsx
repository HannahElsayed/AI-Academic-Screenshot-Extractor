'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  'Analyzing screenshot...',
  'Reading academic tables...',
  'Extracting courses...',
  'Validating data...',
  'Preparing preview...',
];

/** Cycles through the step labels for perceived progress while the request is in flight. */
export function ExtractionStatus() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-ink-100 bg-white px-6 py-10" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-6 text-center">
        <PulsingMark />
        <div className="w-full space-y-2.5">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
                i <= stepIndex ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] ${
                  i < stepIndex
                    ? 'border-moss bg-moss text-white'
                    : i === stepIndex
                      ? 'border-brass text-brass'
                      : 'border-ink-200 text-ink-200'
                }`}
              >
                {i < stepIndex ? '✓' : ''}
              </span>
              <span className={i === stepIndex ? 'font-medium text-ink-700' : 'text-ink-400'}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PulsingMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="17" stroke="#EDE7D9" strokeWidth="3" />
      <circle
        cx="20"
        cy="20"
        r="17"
        stroke="#B08D57"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="30 76"
        className="origin-center animate-spin"
        style={{ animationDuration: '1.1s' }}
      />
    </svg>
  );
}
