'use client';

import { useMemo, useState } from 'react';
import type { ValidationIssue } from '@/types/academic';
import type { EditableCourse, EditableExtraction, EditableSemester } from '@/types/editable';
import { emptyCourse, emptySemester } from '@/types/editable';
import { indexValidationIssues } from '@/lib/validation/issue-map';
import { SemesterCard } from './SemesterCard';

interface AcademicPreviewProps {
  data: EditableExtraction;
  onChange: (data: EditableExtraction) => void;
  validationIssues: ValidationIssue[];
  onConfirmSave: () => void;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  saveError?: string | null;
}

export function AcademicPreview({
  data,
  onChange,
  validationIssues,
  onConfirmSave,
  saveState,
  saveError,
}: AcademicPreviewProps) {
  const [showConfirmNotice, setShowConfirmNotice] = useState(false);
  const indexed = useMemo(() => indexValidationIssues(validationIssues), [validationIssues]);

  const totalCourses = data.semesters.reduce((sum, s) => sum + s.courses.length, 0);
  const totalWarnings = validationIssues.length;

  function updateSemesters(next: EditableSemester[]) {
    onChange({ ...data, semesters: next });
  }

  function handleChangeSemesterField(semesterUiId: string, field: keyof EditableSemester, value: string) {
    updateSemesters(
      data.semesters.map((s) =>
        s.uiId === semesterUiId ? { ...s, [field]: coerceField(field, value) } : s
      )
    );
  }

  function handleChangeCourse(
    semesterUiId: string,
    courseUiId: string,
    field: keyof EditableCourse,
    value: string
  ) {
    updateSemesters(
      data.semesters.map((s) =>
        s.uiId !== semesterUiId
          ? s
          : {
              ...s,
              courses: s.courses.map((c) =>
                c.uiId === courseUiId ? { ...c, [field]: coerceField(field, value) } : c
              ),
            }
      )
    );
  }

  function handleAddCourse(semesterUiId: string) {
    updateSemesters(
      data.semesters.map((s) => (s.uiId === semesterUiId ? { ...s, courses: [...s.courses, emptyCourse()] } : s))
    );
  }

  function handleDeleteCourse(semesterUiId: string, courseUiId: string) {
    updateSemesters(
      data.semesters.map((s) =>
        s.uiId === semesterUiId ? { ...s, courses: s.courses.filter((c) => c.uiId !== courseUiId) } : s
      )
    );
  }

  function handleDeleteSemester(semesterUiId: string) {
    updateSemesters(data.semesters.filter((s) => s.uiId !== semesterUiId));
  }

  function handleAddSemester() {
    updateSemesters([...data.semesters, emptySemester(data.semesters.length)]);
  }

  function handleStudentField(field: 'name' | 'student_id', value: string) {
    onChange({ ...data, student: { ...data.student, [field]: value || null } });
  }

  function handleConfirmClick() {
    if (!showConfirmNotice) {
      setShowConfirmNotice(true);
      return;
    }
    onConfirmSave();
  }

  return (
    <div className="space-y-6">
      <section className="border border-ink-100 bg-white px-5 py-4">
        <h2 className="mb-3 font-serif text-base font-semibold text-ink-700">Student</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LabeledInput
            label="Name"
            value={data.student.name ?? ''}
            onChange={(v) => handleStudentField('name', v)}
            arabic
          />
          <LabeledInput
            label="Student ID"
            value={data.student.student_id ?? ''}
            onChange={(v) => handleStudentField('student_id', v)}
          />
        </div>
      </section>

      {indexed.general.length > 0 && (
        <div className="space-y-1.5 border-l-2 border-brass bg-brass-light/20 px-4 py-3 text-sm text-brass-dark">
          {indexed.general.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      <div className="space-y-5">
        {data.semesters.map((semester, index) => (
          <SemesterCard
            key={semester.uiId}
            semester={semester}
            index={index}
            onChangeSemesterField={handleChangeSemesterField}
            onChangeCourse={handleChangeCourse}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
            onDeleteSemester={handleDeleteSemester}
            getFieldIssues={(semesterIndex, field) => indexed.byField.get(`${semesterIndex}:${field}`) ?? []}
            getCourseFieldIssues={(semesterIndex, courseIndex, field) =>
              indexed.byField.get(`${semesterIndex}:${courseIndex}:${field}`) ?? []
            }
            getCourseRowIssues={(semesterIndex, courseIndex) =>
              indexed.byCourse.get(`${semesterIndex}:${courseIndex}`) ?? []
            }
            getSemesterIssues={(semesterIndex) => indexed.bySemester.get(String(semesterIndex)) ?? []}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSemester}
        className="w-full border border-dashed border-ink-200 py-3 text-sm font-medium text-ink-400 hover:border-brass hover:text-brass-dark"
      >
        + Add another semester
      </button>

      <div className="sticky bottom-4 border border-ink-200 bg-white/95 px-5 py-4 shadow-[0_4px_20px_rgba(27,42,74,0.12)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            {data.semesters.length} semester{data.semesters.length === 1 ? '' : 's'} · {totalCourses} course
            {totalCourses === 1 ? '' : 's'}
            {totalWarnings > 0 && <span className="text-brass-dark"> · {totalWarnings} flagged for review</span>}
          </p>
          <div className="flex items-center gap-3">
            {saveState === 'error' && saveError && <p className="text-sm text-rust">{saveError}</p>}
            {saveState === 'saved' ? (
              <p className="text-sm font-medium text-moss">Saved.</p>
            ) : (
              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={saveState === 'saving'}
                className="bg-ink-600 px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:bg-ink-200"
              >
                {saveState === 'saving' ? 'Saving...' : 'Confirm & Save'}
              </button>
            )}
          </div>
        </div>
        {showConfirmNotice && saveState !== 'saved' && (
          <p className="mt-3 border-t border-ink-100 pt-3 text-sm text-ink-500">
            Please review your extracted academic information before saving. Click{' '}
            <span className="font-semibold">Confirm &amp; Save</span> again to save it.
          </p>
        )}
      </div>
    </div>
  );
}

function coerceField(field: string, value: string): string | number | null {
  const numericFields = ['semester_gpa', 'cumulative_gpa', 'total_credit_hours', 'grade_points', 'credit_hours', 'quality_points'];
  if (numericFields.includes(field)) {
    if (value.trim() === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
  }
  return value;
}

function LabeledInput({
  label,
  value,
  onChange,
  arabic,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  arabic?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={arabic ? 'auto' : undefined}
        className={`w-full border border-ink-100 px-3 py-2 text-sm outline-none focus:border-ink-400 ${
          arabic ? 'arabic-text' : ''
        }`}
        placeholder="Not detected"
      />
    </label>
  );
}
