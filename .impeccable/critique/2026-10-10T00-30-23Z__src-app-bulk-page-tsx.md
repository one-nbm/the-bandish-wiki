---
target: src/app/bulk/page.tsx
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\neill\\bandish-wiki\\src\\app\\bulk\\page.tsx"
target_fingerprint: "sha256:d3f4c955ab0d06ba95656497f30bfaca9897412847b63892d36dd48f008da389"
target_path: "C:\\Users\\neill\\bandish-wiki\\src\\app\\bulk\\page.tsx"
timestamp: 2026-10-10T00-30-23Z
slug: src-app-bulk-page-tsx
---
# Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Basic button loading text; no progress bar for multi-item uploads, no syntax linting, and no preview of parsed bandishes. |
| 2 | Match System / Real World | 1 | Music catalogers think in raags, taals, and verses; interface forces them into raw JSON syntax, escaped newlines, and manual UUID v4 hashes. |
| 3 | User Control and Freedom | 1 | No dry-run, no undo, no confirmation step; textarea is instantly wiped upon success, destroying user's raw input. |
| 4 | Consistency and Standards | 2 | Passcode field uses red error token (`bg-m3-error/10`) in resting state before any validation error occurs. |
| 5 | Error Prevention | 1 | No pre-submit schema validation (only raw `JSON.parse`); missing required fields like `title` or `raag` slip through to backend error. |
| 6 | Recognition Rather Than Recall | 2 | Guide is thorough but lacks one-click "Copy Template", "Load Example", or download sample buttons. |
| 7 | Flexibility and Efficiency | 1 | No drag-and-drop file upload (.json/.csv); user must manually copy-paste into an unformatted textarea. |
| 8 | Aesthetic and Minimalist Design | 2 | Guide is a monolithic wall of text; primary action uses an over-bouncing easing curve (`cubic-bezier(0.34, 1.56, 0.64, 1)`). |
| 9 | Error Recovery | 2 | Generic error box for JSON parse errors; lacks line/column syntax highlighting or field-level validation markers. |
| 10 | Help and Documentation | 3 | Guide is comprehensive across 5 schema sections, but static and disconnected from the input form on mobile/tablet viewports. |
| **Total** | | **17/40** | **Poor** |

#### Design Specificity Verdict

**LLM assessment**: While the page applies Bandish Wiki's M3 tokens (`rounded-[2.5rem]`, Google Sans, deep purple brand colors), the interaction model is an engineering-first developer utility disguised as an end-user admin tool. Classical music archivists are asked to deal with raw JSON string escaping (`\n\n`) and UUID generation. There is zero domain-specific scaffolding: no bulk musical table preview, no audio link validator, and no raag/taal auto-detection.

**Deterministic scan**: The Impeccable detector flagged 1 warning on `src/app/bulk/page.tsx`:
- `line 92`: **bounce-easing** (`cubic-bezier(0.34, 1.56, 0.64, 1)`) on the primary submit button. Bouncing ease curves on database-writing action buttons feel unstable and ungrounded.

**Visual overlays**: Automated browser injection was unavailable due to local harness Playwright driver availability; evaluation was conducted directly via code inspection and CLI scanner evidence.

#### Overall Impression
An essential admin back-office feature that currently functions as a raw database JSON terminal rather than a curated bulk ingestion tool. It lacks safety guardrails (no preview, no confirmation modal, no dry run) and burdens contributors with JSON syntax overhead.

#### What's Working
1. **Comprehensive Documentation (`BulkGuide.tsx`)**: The field definitions, lowercase conventions, and stanza formatting rules are clearly documented with concrete code examples.
2. **Sticky Dual-Column Layout on Large Desktops**: Placing the form in a sticky container (`xl:sticky xl:top-24`) alongside the scrolling guide allows desktop users to consult rules while keeping the textarea in view.
3. **M3 Token Consistency**: Adheres to the wiki's flat elevation rules (no drop shadows, using tonal borders `border-m3-surface-high` and clean rounded geometries).

#### Priority Issues
- **[P0] Blind Write with No Preview or Confirmation**
  - **Why it matters**: Bulk insertion directly commits dozens of records to the production database without a dry-run or preview. On success, the input is immediately wiped, leaving the admin with no audit trail or record of what was created.
  - **Fix**: Introduce a two-step flow: Step 1 validates the payload and displays a parsed preview table (titles, raags, taals, validation tags). Step 2 prompts for final confirmation before executing the insert.
  - **Suggested command**: `/impeccable harden`

- **[P1] High-Friction Raw-JSON Input with Manual UUIDs**
  - **Why it matters**: Expecting classical music contributors to format raw JSON arrays and generate valid UUID v4 strings (`"e2f89c62-..."`) is an extreme barrier to entry that guarantees syntax errors and abandoned uploads.
  - **Fix**: Automatically generate UUIDs on the backend if omitted. Add file drop support (.json / .csv) and a "Load Sample Payload" button in the form.
  - **Suggested command**: `/impeccable clarify`

- **[P1] Permanent "Error State" Visual Styling on Resting Passcode Input**
  - **Why it matters**: The passcode input uses red error styling (`bg-m3-error/10`, `border-m3-error`, `text-m3-error`) before the user has entered anything, triggering false alarm and breaking standard form conventions where red indicates failure.
  - **Fix**: Use standard neutral surface styling (`bg-m3-surface dark:bg-m3-surface-dark border-m3-surface-high focus:border-m3-primary`) for the resting state, activating `m3-error` only upon an invalid passcode submission.
  - **Suggested command**: `/impeccable polish`

- **[P2] Guide-Form Disconnection on Viewports < 1280px**
  - **Why it matters**: Below the `xl` breakpoint, the guide drops below the form, requiring users to scroll down hundreds of pixels to check field specs and scroll back up to edit, causing severe working memory strain.
  - **Fix**: Implement responsive tabs on mobile/tablet viewports ("Upload Payload" | "Format Guide" | "Preview") so users can switch views without losing context.
  - **Suggested command**: `/impeccable adapt`

#### Persona Red Flags
- **Alex (Power User / Admin)**: No keyboard shortcut (Ctrl+Enter) to submit. Must manually format JSON outside in a code editor. Cannot drag and drop JSON files directly from disk.
- **Jordan (First-Time Contributor)**: Intimidated by the raw JSON textarea and the red passcode input. Has a text file with 10 bandishes but cannot figure out how to generate a UUID v4 string. Abandons the page.
- **Riley (Stress Tester)**: Pastes a JSON array with 50 items where item #49 has an extra trailing comma. Receives a raw browser error message (`Unexpected token in JSON at position...`) with zero indication of which line or bandish failed.

#### Minor Observations
- Missing copy button on the example code blocks in `BulkGuide.tsx`.
- The textarea lacks monospace line numbers and syntax highlighting, making bracket balancing difficult.
- The success message (`Success! Added 15 bandishes.`) is plain text with no link to navigate to the search page or view the newly added compositions.

#### Questions to Consider
- What if the uploader parsed spreadsheets or CSV files directly alongside JSON?
- Could the system automatically validate YouTube rendition URLs before executing the bulk insert?
- What would an interactive batch review table look like where admins can review and tweak individual records before committing?
