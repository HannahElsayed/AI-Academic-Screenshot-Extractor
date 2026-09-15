'use client';

import { Fragment } from 'react';
import type { EditableCourse } from '@/types/editable';
import { Badge } from '@/components/ui/Badge';

interface CourseTableProps {
  courses: EditableCourse[];
  onChangeCourse: (courseUiId: string, field: keyof EditableCourse, value: string) => void;
  onDeleteCourse: (courseUiId: string) => void;
  getFieldIssues: (courseIndex: number, field: string) => string[];
  getRowIssues: (courseIndex: number) => string[];
}

export function CourseTable({ courses, onChangeCourse, onDeleteCourse, getFieldIssues, getRowIssues }: CourseTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left text-xs text-ink-400">
            <th className="w-32 py-2 pr-3 font-medium">Course Code</th>
            <th className="py-2 pr-3 font-medium">Course Name</th>
            <th className="w-24 py-2 pr-3 font-medium">Grade</th>
            <th className="w-28 py-2 pr-3 text-right font-medium">Grade Points</th>
            <th className="w-28 py-2 pr-3 text-right font-medium">Credit Hours</th>
            <th className="w-28 py-2 pr-3 text-right font-medium">Quality Points</th>
            <th className="w-10 py-2" />
          </tr>
        </thead>
        <tbody>
          {courses.map((course, courseIndex) => {
            const rowIssues = getRowIssues(courseIndex);
            return (
              <Fragment key={course.uiId}>
                <tr className="border-b border-ink-50 align-top">
                  <Cell
                    value={course.course_code}
                    onChange={(v) => onChangeCourse(course.uiId, 'course_code', v)}
                    issues={getFieldIssues(courseIndex, 'course_code')}
                  />
                  <Cell
                    value={course.course_name}
                    onChange={(v) => onChangeCourse(course.uiId, 'course_name', v)}
                    issues={getFieldIssues(courseIndex, 'course_name')}
                    arabic
                  />
                  <Cell
                    value={course.grade}
                    onChange={(v) => onChangeCourse(course.uiId, 'grade', v)}
                    issues={getFieldIssues(courseIndex, 'grade')}
                  />
                  <Cell
                    value={course.grade_points ?? ''}
                    onChange={(v) => onChangeCourse(course.uiId, 'grade_points', v)}
                    issues={getFieldIssues(courseIndex, 'grade_points')}
                    align="right"
                    numeric
                  />
                  <Cell
                    value={course.credit_hours ?? ''}
                    onChange={(v) => onChangeCourse(course.uiId, 'credit_hours', v)}
                    issues={getFieldIssues(courseIndex, 'credit_hours')}
                    align="right"
                    numeric
                  />
                  <Cell
                    value={course.quality_points ?? ''}
                    onChange={(v) => onChangeCourse(course.uiId, 'quality_points', v)}
                    issues={getFieldIssues(courseIndex, 'quality_points')}
                    align="right"
                    numeric
                  />
                  <td className="py-2 pl-2 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteCourse(course.uiId)}
                      aria-label={`Delete course ${course.course_code || courseIndex + 1}`}
                      className="text-ink-300 hover:text-rust"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
                {rowIssues.length > 0 && <RowIssueNote issues={rowIssues} />}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Cell({
  value,
  onChange,
  issues,
  align = 'left',
  numeric = false,
  arabic = false,
}: {
  value: string | number;
  onChange: (value: string) => void;
  issues: string[];
  align?: 'left' | 'right';
  numeric?: boolean;
  arabic?: boolean;
}) {
  const hasIssue = issues.length > 0;
  return (
    <td className="py-1.5 pr-3">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={numeric ? 'decimal' : 'text'}
        dir={arabic ? 'auto' : undefined}
        title={hasIssue ? issues.join(' ') : undefined}
        className={`w-full border bg-transparent px-2 py-1.5 text-sm outline-none transition-colors ${
          arabic ? 'arabic-text' : ''
        } ${align === 'right' ? 'text-right' : 'text-left'} ${
          hasIssue
            ? 'border-brass/70 bg-brass-light/20 focus:border-brass'
            : 'border-transparent hover:border-ink-100 focus:border-ink-300'
        }`}
      />
    </td>
  );
}

function RowIssueNote({ issues }: { issues: string[] }) {
  return (
    <tr>
      <td colSpan={7} className="pb-2 pt-0">
        <div className="flex flex-wrap gap-1.5 pl-1">
          {issues.map((issue, i) => (
            <Badge tone="warning" key={i}>
              {issue}
            </Badge>
          ))}
        </div>
      </td>
    </tr>
  );
}
