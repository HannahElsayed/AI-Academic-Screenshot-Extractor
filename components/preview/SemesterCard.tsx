'use client';

import type { EditableSemester, EditableCourse } from '@/types/editable';
import { CourseTable } from './CourseTable';
import { Badge } from '@/components/ui/Badge';

interface SemesterCardProps {
  semester: EditableSemester;
  index: number;
  onChangeSemesterField: (semesterUiId: string, field: keyof EditableSemester, value: string) => void;
  onChangeCourse: (semesterUiId: string, courseUiId: string, field: keyof EditableCourse, value: string) => void;
  onAddCourse: (semesterUiId: string) => void;
  onDeleteCourse: (semesterUiId: string, courseUiId: string) => void;
  onDeleteSemester: (semesterUiId: string) => void;
  getFieldIssues: (semesterIndex: number, field: string) => string[];
  getCourseFieldIssues: (semesterIndex: number, courseIndex: number, field: string) => string[];
  getCourseRowIssues: (semesterIndex: number, courseIndex: number) => string[];
  getSemesterIssues: (semesterIndex: number) => string[];
}

export function SemesterCard({
  semester,
  index,
  onChangeSemesterField,
  onChangeCourse,
  onAddCourse,
  onDeleteCourse,
  onDeleteSemester,
  getFieldIssues,
  getCourseFieldIssues,
  getCourseRowIssues,
  getSemesterIssues,
}: SemesterCardProps) {
  const semesterIssues = getSemesterIssues(index);

  return (
    <section className="border border-ink-100 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 bg-parchment/30 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 font-serif text-sm text-brass-dark">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <input
              value={semester.semester_name}
              onChange={(e) => onChangeSemesterField(semester.uiId, 'semester_name', e.target.value)}
              placeholder="Semester name"
              className="border-b border-transparent bg-transparent font-serif text-lg font-semibold text-ink-700 outline-none hover:border-ink-100 focus:border-brass"
            />
            {semesterIssues.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {semesterIssues.map((issue, i) => (
                  <Badge tone="warning" key={i}>
                    {issue}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <LabeledStat
            label="Semester GPA"
            value={semester.semester_gpa}
            onChange={(v) => onChangeSemesterField(semester.uiId, 'semester_gpa', v)}
            issues={getFieldIssues(index, 'semester_gpa')}
          />
          <LabeledStat
            label="Cumulative GPA"
            value={semester.cumulative_gpa}
            onChange={(v) => onChangeSemesterField(semester.uiId, 'cumulative_gpa', v)}
            issues={getFieldIssues(index, 'cumulative_gpa')}
          />
          <LabeledStat
            label="Credit Hours"
            value={semester.total_credit_hours}
            onChange={(v) => onChangeSemesterField(semester.uiId, 'total_credit_hours', v)}
            issues={getFieldIssues(index, 'total_credit_hours')}
          />
          <button
            type="button"
            onClick={() => onDeleteSemester(semester.uiId)}
            className="text-xs font-medium text-ink-400 underline decoration-ink-200 underline-offset-4 hover:text-rust"
          >
            Remove semester
          </button>
        </div>
      </header>

      <div className="px-5 py-4">
        <CourseTable
          courses={semester.courses}
          onChangeCourse={(courseUiId, field, value) => onChangeCourse(semester.uiId, courseUiId, field, value)}
          onDeleteCourse={(courseUiId) => onDeleteCourse(semester.uiId, courseUiId)}
          getFieldIssues={(courseIndex, field) => getCourseFieldIssues(index, courseIndex, field)}
          getRowIssues={(courseIndex) => getCourseRowIssues(index, courseIndex)}
        />
        <button
          type="button"
          onClick={() => onAddCourse(semester.uiId)}
          className="mt-3 border border-ink-100 px-3 py-1.5 text-xs font-medium text-ink-500 hover:border-brass hover:text-brass-dark"
        >
          + Add course
        </button>
      </div>
    </section>
  );
}

function LabeledStat({
  label,
  value,
  onChange,
  issues,
}: {
  label: string;
  value: number | null;
  onChange: (value: string) => void;
  issues: string[];
}) {
  const hasIssue = issues.length > 0;
  return (
    <label className="flex flex-col items-end gap-0.5">
      <span className="text-[11px] text-ink-400">{label}</span>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder="—"
        title={hasIssue ? issues.join(' ') : undefined}
        className={`w-20 border-b bg-transparent px-1 py-0.5 text-right text-sm font-medium outline-none ${
          hasIssue ? 'border-brass text-brass-dark' : 'border-ink-100 text-ink-700 focus:border-ink-400'
        }`}
      />
    </label>
  );
}
