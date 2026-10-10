---
target_identity: "file:C:\\Users\\neill\\bandish-wiki\\src\\app\\editor\\page.tsx"
target_fingerprint: "sha256:4fe6b462889a83c1da0f4574769723a67272f35cefcee853d9767e448675e410"
target_path: "C:\\Users\\neill\\bandish-wiki\\src\\app\\editor\\page.tsx"
timestamp: 2026-10-10T00-56-26Z
slug: src-app-editor-page-tsx
---
# Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Profile update fails with a blocking browser `alert()`; adding queue items lacks inline validation or status confirmation. |
| 2 | Match System / Real World | 2 | "Bandishes to Index" uses backend indexing jargon rather than intuitive editorial phrasing like "Reference Recording Queue". |
| 3 | User Control and Freedom | 2 | Deleting an item from the queue takes immediate destructive effect with zero confirmation or undo opportunity. |
| 4 | Consistency and Standards | 2 | Inconsistent corner radiuses (`rounded-xl` vs `rounded-[1.5rem]`); uses generic `border-gray-200` instead of M3 tonal tokens. |
| 5 | Error Prevention | 1 | Unsafe client-side integer parsing for Raag ID generation (`Math.max(...currentIds) + 1`); instantaneous unconfirmed delete in queue. |
| 6 | Recognition Rather Than Recall | 2 | Contributor stats show raw numbers (`4`, `2`) with no drill-down to view or edit the actual compositions contributed. |
| 7 | Flexibility and Efficiency | 2 | No search, sorting, or filtering within the queue; no batch operations or editorial keyboard shortcuts. |
| 8 | Aesthetic and Minimalist Design | 2 | Four disconnected card widgets stacked vertically without visual hierarchy; bounce easing (`cubic-bezier(0.34,1.56,0.64,1)`) flagged in modal. |
| 9 | Error Recovery | 1 | `alert("Failed to update name: " + error.message)` breaks modern web UX; no field-level error messages in forms. |
| 10 | Help and Documentation | 2 | No guidance on formatting musical notation (Aaroh/Avaroh), editorial guidelines, or queue processing status. |
| **Total** | | **18/40** | **Poor** |

#### Design Specificity Verdict

**LLM assessment**: The Editor Dashboard currently operates as a disconnected collection of loose widgets rather than a cohesive administrative mission control. An editor visiting the page sees two isolated counter blocks, a basic profile text input, two action triggers, and a cramped 400px queue box. The interface lacks classical music curation workflows—there is no list of "Compositions I've Contributed", no way to review or edit pending recordings, and no musical domain scaffolding.

**Deterministic scan**: The Impeccable detector flagged 2 warnings in `src/app/editor/AddRaagModal.tsx`:
- `line 163`: **bounce-easing** (`cubic-bezier(0.34, 1.56, 0.64, 1)`) on the modal container dialog.
- `line 301`: **bounce-easing** (`cubic-bezier(0.34, 1.56, 0.64, 1)`) on the primary submit button.

**Visual overlays**: Automated browser injection was bypassed because `/editor` requires an authenticated editor session cookie via server-side redirect (`checkIsEditor()`); evaluation was performed via direct component analysis and CLI detector scan.

#### Overall Impression
The surface is an early MVP admin container that lacks editorial workflow depth. While the ambient purple glow and Google Sans typography align with the site's branding, the interactions suffer from unconfirmed destructive actions, client-side ID race conditions, native browser alerts, and static counters that don't let editors inspect or manage their work.

#### What's Working
1. **Clean M3 Typography & Ambient Theming**: Uses the standard Google Sans Flex font tokens and soft ambient purple glow consistent with the main Wiki pages.
2. **Accessible Modal Architecture in `AddRaagModal`**: Includes Escape key listener, scroll locking with scrollbar width compensation, and backdrop dismiss.
3. **Smooth Scrollbar Integration**: Uses the custom `m3-scrollbar` styling in scrollable containers.

#### Priority Issues
- **[P0] Unconfirmed Destructive Deletes & Client-Side Sequential ID Generation**
  - **Why it matters**: Clicking the delete button on any rendition in the queue instantly purges it from Supabase without confirmation or undo. In `AddRaagModal`, calculating the next sequential ID on the client (`Math.max(...currentIds) + 1`) introduces catastrophic race conditions and key collisions.
  - **Fix**: Add a confirmation modal or undo toast for queue deletion. Move ID generation to a database sequence or UUID.
  - **Suggested command**: `/impeccable harden`

- **[P1] Missing "My Contributions" Management Drill-Down**
  - **Why it matters**: Displaying "14 Bandishes Added" and "3 Raags Added" as static numbers gives editors zero utility. They cannot view their submitted compositions, track edits, or make corrections without leaving the dashboard and manually searching.
  - **Fix**: Make stat cards interactive or provide a "My Contributions" tab/table with direct edit and view links.
  - **Suggested command**: `/impeccable shape`

- **[P1] Native `window.alert()` & Inconsistent Design System Tokens**
  - **Why it matters**: Triggering `alert()` freezes the tab thread and looks broken. Profile inputs use hardcoded Tailwind grays (`border-gray-200 dark:border-gray-700`) rather than theme tokens (`border-m3-surface-high`), and modal transitions use dated bounce easing.
  - **Fix**: Replace `window.alert` with inline toast/state badges, standardize on M3 tokens, and switch to exponential `ease-out`.
  - **Suggested command**: `/impeccable polish`

- **[P2] Ambiguous Staging Queue in Cramped 400px Viewport**
  - **Why it matters**: "Bandishes to Index" confuses editors who don't know what "indexing" means vs adding a rendition directly. The fixed 400px container with nested inputs feels crowded on mobile.
  - **Fix**: Re-title to "Reference Recording Staging Queue", add contextual helper documentation, and give the form dedicated breathing room.
  - **Suggested command**: `/impeccable clarify`

#### Persona Red Flags
- **Alex (Power User / Active Editor)**: Stares at "24 Bandishes Added" with no way to click through to inspect or update their catalog. Has to manually search for each composition on the public home page.
- **Jordan (First-Time Contributor)**: Enters a YouTube link into "Bandishes to Index" without knowing who will index it, what format is expected, or where it appears next.
- **Riley (Stress Tester)**: Clicks the remove icon on an item in the queue; the record instantly disappears forever with no prompt or undo.

#### Minor Observations
- Missing placeholder feedback or character counters for the Raag Description textarea.
- The `Edit Name` flow does not validate against blank whitespace or special characters before submitting to Supabase.
- The queue item cards show raw URLs without a favicon or domain badge.

#### Questions to Consider
- What if the Editor Dashboard included a list of recently edited or flagged bandishes across the community?
- Could editors see the status of renditions in the queue (e.g. "Pending Transcription", "Assigned", "Indexed")?
- Would editors benefit from quick-create templates for common Raags and Taals?
