---
target: src/app/page.tsx
total_score: 31
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\neill\\bandish-wiki\\src\\app\\page.tsx"
target_fingerprint: "sha256:686e808b5194fa82759457d3adf80b7443b8f9499308dcc39028dadaf16ccc70"
target_path: "C:\\Users\\neill\\bandish-wiki\\src\\app\\page.tsx"
timestamp: 2026-09-27T23-28-42Z
slug: src-app-page-tsx
closed: true
---
⚠️ DEGRADED: single-context (no general sub-agent tool exposed)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Showing X bandishes updates instantly; clear focus states |
| 2 | Match System / Real World | 4 | Musical terms (Raag, Taal) used correctly |
| 3 | User Control and Freedom | 4 | Clear filters, view options toggles, escape routes |
| 4 | Consistency and Standards | 3 | Custom glur and specific spacing are cohesive, but floating elements feel detached |
| 5 | Error Prevention | 3 | Search handles input gracefully, but zero-results state needs handling |
| 6 | Recognition Rather Than Recall | 4 | Cards show all info; filters are visible tags |
| 7 | Flexibility and Efficiency | 3 | Ctrl+K shortcut implemented for search |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, but view options floating could be simpler |
| 9 | Error Recovery | n/a | Search page context; no destructive actions |
| 10 | Help and Documentation | 3 | Info button present and accessible |
| **Total** | | **31/36** | **Good** |

#### Design Specificity Verdict

**LLM assessment**: The design is highly specific. It establishes a strong "Melodic Archive" aesthetic with M3 Deep Purple and heavy frosted glass layering. It feels authored specifically for this product due to the specific typographic and layout choices (masonry grid for lyrics, unique view options dropdown, transliterated language toggle).

**Deterministic scan**: The detector flagged 14 instances of `bounce-easing` (the `cubic-bezier(0.34, 1.56, 0.64, 1)` usage), labeling it "slop" for being bouncy instead of a smooth exponential ease. However, this is a **false positive**. The product's `DESIGN.md` explicitly mandates this specific cubic bezier to provide playful spring physics for all interactive elements, making it an intentional brand aesthetic.

**Visual overlays**: N/A (degraded inline run without browser injection).

#### Overall Impression
The archive feels robust, premium, and distinct. The frosted glass search header anchoring the dark-mode masonry grid is excellent. The biggest opportunity is cleaning up the search controls (Add, Info, View Options) so they feel like a unified control bar rather than floating disparate actions.

#### What's Working
1. **The Frosted Glass Header:** The 4-layer exponential glur creates a stunning physical depth effect without layout thrashing.
2. **Interactive Spring:** The hover and active scaling states on cards and buttons make the UI feel alive and tactile.
3. **Typography and Readability:** Relaxed leading and high-contrast pill tags ensure the lyrics and metadata remain perfectly legible.

#### Priority Issues
- **[P1] Search Controls Layout**: The "View Options" button floats underneath the search bar, feeling disconnected from the primary actions (Add/Info) above it.
  - **Why it matters**: It disrupts the visual hierarchy and makes the header taller than necessary.
  - **Fix**: Consolidate the controls into a single unified action bar next to or integrated with the search input.
  - **Suggested command**: `/impeccable layout`
- **[P1] Zero Results State**: Searching for a non-existent bandish currently just empties the grid.
  - **Why it matters**: Users might think the app is broken or still loading, leading to high bounce rates.
  - **Fix**: Design a deliberate empty state with clear next actions (e.g., "Submit this Bandish" or "Clear filters").
  - **Suggested command**: `/impeccable onboard`
- **[P2] Mobile Search Usability**: The "Add Bandish" button shrinks to an icon on mobile, but the search bar remains large and disconnected from the filters.
  - **Why it matters**: Thumb reachability is poor, and the interface occupies too much vertical space on small screens.
  - **Fix**: Condense the mobile header into a sticky bottom-sheet or a tighter top navigation row.
  - **Suggested command**: `/impeccable adapt`

#### Persona Red Flags

**Jordan (First-Timer)**: The "View Options" button uses a "tune" (filter) icon, but the main filtering happens via the search text and tags. Jordan might click View Options expecting to filter by Raag/Taal and get confused by UI toggles.

**Riley (Deliberate Stress Tester)**: If Riley types a massive string of gibberish, the grid goes blank without any feedback or recovery path, offering no clear exit back to the main list.

**Casey (Distracted Mobile User)**: Reaching the search bar and the View Options button at the very top of the screen requires stretching the thumb, violating the thumb-zone rule.

#### Minor Observations
- The masonry grid transitions nicely, but very long lyrics might break the flow if not clamped.
- The Info modal could use the same spring animations as the dropdowns.

#### Questions to Consider
- Should "View Options" really be a primary floating button, or should it just be an icon inside the search bar?
- What happens if the search yields zero results? Does the user get prompted to submit it?
