'use client';

import { useEffect, useRef, useState } from 'react';
import { UploadZone } from '@/components/upload/UploadZone';
import { ImagePreview } from '@/components/upload/ImagePreview';
import { ExtractionStatus } from '@/components/status/ExtractionStatus';
import { AcademicPreview } from '@/components/preview/AcademicPreview';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { toEditable, toRaw } from '@/types/editable';
import type { EditableExtraction } from '@/types/editable';
import type { ExtractionResponse, SaveResponse, ValidationIssue } from '@/types/academic';

type FlowStage = 'upload' | 'extracting' | 'preview';

export default function Home() {
  const [stage, setStage] = useState<FlowStage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<EditableExtraction | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleFileSelected(selected: File) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(selected);
    objectUrlRef.current = url;
    setFile(selected);
    setPreviewUrl(url);
    setExtractError(null);
  }

  function handleRemoveFile() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setFile(null);
    setPreviewUrl(null);
    setExtractError(null);
  }

  async function handleExtract() {
    if (!file) return;
    setStage('extracting');
    setExtractError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/extract', { method: 'POST', body: formData });
      const json: ExtractionResponse = await res.json();

      if (!json.success) {
        // EMPTY_EXTRACTION still returns a (mostly empty) data shape so the
        // user can add courses manually instead of starting over.
        if (json.data) {
          setEditableData(toEditable(json.data));
          setValidationIssues(json.validationIssues ?? []);
          setExtractError(json.error?.message ?? 'Extraction did not find any data.');
          setStage('preview');
          return;
        }
        setExtractError(json.error?.message ?? 'Extraction failed. Please try again.');
        setStage('upload');
        return;
      }

      setEditableData(toEditable(json.data!));
      setValidationIssues(json.validationIssues ?? []);
      setStage('preview');
    } catch {
      setExtractError('Something went wrong reaching the extraction service. Please try again.');
      setStage('upload');
    }
  }

  async function handleConfirmSave() {
    if (!editableData) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: toRaw(editableData) }),
      });
      const json: SaveResponse = await res.json();
      if (!json.success) {
        setSaveState('error');
        setSaveError(json.error ?? 'Could not save this record. Please try again.');
        return;
      }
      setSaveState('saved');
    } catch {
      setSaveState('error');
      setSaveError('Could not reach the server to save this record. Please try again.');
    }
  }

  function startOver() {
    handleRemoveFile();
    setEditableData(null);
    setValidationIssues([]);
    setSaveState('idle');
    setSaveError(null);
    setStage('upload');
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      <header className="mb-10">
        <p className="mb-2 font-serif text-sm text-brass-dark">AI Academic Screenshot Extractor</p>
        <h1 className="font-serif text-3xl font-semibold leading-tight text-ink-700 sm:text-4xl">
          Turn a grades screenshot into a transcript you can actually use.
        </h1>
        <p className="mt-3 max-w-xl text-ink-500">
          Upload a screenshot of your university results page. AI reads the tables — courses,
          grades, credit hours, GPA — and hands you an editable draft to check before anything is
          saved.
        </p>
      </header>

      {stage === 'upload' && (
        <div className="space-y-5">
          {!file ? (
            <UploadZone onFileSelected={handleFileSelected} errorMessage={extractError} />
          ) : (
            <>
              {previewUrl && (
                <ImagePreview file={file} previewUrl={previewUrl} onRemove={handleRemoveFile} onExtract={handleExtract} />
              )}
              {extractError && <ErrorBanner message={extractError} onDismiss={() => setExtractError(null)} />}
            </>
          )}
        </div>
      )}

      {stage === 'extracting' && <ExtractionStatus />}

      {stage === 'preview' && editableData && (
        <div className="space-y-5">
          {extractError && <ErrorBanner message={extractError} onDismiss={() => setExtractError(null)} />}
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink-700">Review your academic record</h2>
            <button type="button" onClick={startOver} className="text-sm font-medium text-ink-400 underline decoration-ink-200 underline-offset-4 hover:text-ink-600">
              Start over
            </button>
          </div>
          <AcademicPreview
            data={editableData}
            onChange={setEditableData}
            validationIssues={validationIssues}
            onConfirmSave={handleConfirmSave}
            saveState={saveState}
            saveError={saveError}
          />
        </div>
      )}
    </main>
  );
}
