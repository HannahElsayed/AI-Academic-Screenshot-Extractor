# AI Academic Screenshot Data Extractor

Upload a screenshot of a university grades/results page. Gemini reads the
tables and returns structured academic data — courses, grades, credit
hours, GPA — which you review and edit before anything is saved.

```
Upload Screenshot → Preview → Send to Gemini → Extract JSON → Validate
→ Editable Preview → Confirm & Save
```

## Setup

```bash
npm install
cp .env.example .env.local   # then add your GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000. Get a Gemini API key at
https://aistudio.google.com/app/apikey.

`.env.local` is git-ignored (see `.gitignore`) — the key is only ever read
server-side in `lib/gemini/service.ts` and never reaches the browser.

## Architecture

```
app/
  page.tsx                 Client-side flow orchestrator (upload → extract → edit → save)
  api/extract/route.ts     Backend route: validates the image, calls Gemini, validates the result
  api/save/route.ts        Backend route: persists the confirmed record

components/
  upload/UploadZone.tsx     Drag & drop / click-to-upload
  upload/ImagePreview.tsx   Preview + remove/replace + "Extract" trigger
  status/ExtractionStatus.tsx  Stepped loading state
  preview/AcademicPreview.tsx  Student info + semesters + Confirm & Save bar
  preview/SemesterCard.tsx     One editable semester (name, GPA, credit hours)
  preview/CourseTable.tsx      Editable course rows, with per-field warning highlights
  ui/                          Small shared primitives (Badge, ErrorBanner)

lib/
  gemini/
    prompt.ts     The instruction prompt sent to Gemini
    schema.ts     JSON schema description (given to the model) + a Zod schema
                  used to validate the shape of what comes back
    service.ts    GeminiAcademicExtractionService, behind an
                  AcademicExtractionService interface + getExtractionService()
                  factory — swap providers/models by writing a new class and
                  changing what the factory returns
  validation/
    image-validator.ts  Upload validation: type, size, emptiness
    validator.ts        Post-extraction sanity checks (GPA range,
                         quality_points ≈ grade_points × credit_hours, etc.)
                         Never mutates extracted values — only flags issues.
    issue-map.ts         Client-side helper indexing ValidationIssue[] by
                          semester/course/field so the preview can highlight
                          the exact input that needs a look
  save/
    save-service.ts  SaveService interface + a JSON-file-backed
                      implementation (.data/academic-records.json).
                      Swap in a real database later by implementing the
                      same interface.

types/
  academic.ts   Domain types shared by frontend and backend (mirrors the
                schema Gemini is asked to return)
  editable.ts   UI-only types that add a stable client-side id to each
                row for editing/list rendering, plus toEditable/toRaw
                converters
```

Nothing is saved automatically. `/api/extract` only returns a proposed,
editable draft; `/api/save` is a separate call the user triggers
explicitly from **Confirm & Save**.

## Validation, not correction

The backend checks things like GPA ranges and whether
`quality_points ≈ grade_points × credit_hours`, but it never silently
changes a value Gemini extracted — mismatches are surfaced as warnings in
the preview (amber highlight on the field, with the reason on hover) so
the user decides what's right.

## Extending this later

The roadmap this was built for — PDF transcripts, multiple image uploads,
an OCR fallback, a CGPA/graduation calculator, exports, multi-student
history — isn't implemented, but the seams are already there:

- **A new extraction source** (PDF, OCR fallback): implement
  `AcademicExtractionService` in `lib/gemini/service.ts` and branch on
  file type in `app/api/extract/route.ts`.
- **A real database**: implement `SaveService` in
  `lib/save/save-service.ts` and swap what `getSaveService()` returns.
- **Analytics/calculators**: `types/academic.ts` already carries GPA,
  credit hours, and quality points per course/semester — a CGPA or
  "required GPA" calculator can be built as a pure function over
  `RawExtractionResult` without touching the extraction or save layers.
- **Multiple students / history**: `SavedRecord` in `save-service.ts`
  already has an `id` and `savedAt`; `listAll()`/`getById()` are in place
  for a future history view.

## Notes

- Max upload size is 8MB; accepted types are PNG, JPG/JPEG, WebP (see
  `lib/validation/image-validator.ts`).
- The Gemini model used is `gemini-2.0-flash` (set in
  `lib/gemini/service.ts`) — change `MODEL_NAME` there to use a different
  model.
- The local JSON store under `.data/` is meant for development; it's
  git-ignored and not meant to be the production datastore.
