---
target: src/app/bandish/[id]/RenditionModals
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\neill\\bandish-wiki\\src\\app\\bandish\\[id]\\RenditionModals"
timestamp: 2026-09-23T03-53-42Z
slug: src-app-bandish-id-renditionmodals
---
Method: ⚠️ DEGRADED: single-context (running sequentially to prioritize CLI feedback without a generic sub-agent tool)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good "Saving..." state on buttons, but lacks inline validation |
| 2 | Match System / Real World | 4 | Clear terminology (Artist, URL, Rendition) |
| 3 | User Control and Freedom | 2 | No keyboard support (Escape key) to close the modals |
| 4 | Consistency and Standards | 3 | Inconsistent architecture: Edit uses `createPortal`, Add does not |
| 5 | Error Prevention | 3 | Uses native `confirm()` for destructive delete actions |
| 6 | Recognition Rather Than Recall | 4 | Placeholders provide clear examples of expected input |
| 7 | Flexibility and Efficiency | 2 | Heavy reliance on mouse interaction; no keyboard shortcuts |
| 8 | Aesthetic and Minimalist Design | 4 | The modal UI itself matches the beautiful M3 layout of the main app |
| 9 | Error Recovery | 1 | Database errors trigger a jarring, unstyled browser `alert()` |
| 10 | Help and Documentation | 4 | Modal headers clearly explain their purpose |
| **Total** | | **30/40** | **Good** |

#### Design Specificity Verdict

**LLM assessment**: The visual design of the modals successfully matches the high-quality M3 aesthetics of the main application. However, the interaction design lags behind. The modals suffer from the exact same "unhardened" state that the main `page.tsx` had before we fixed it.

**Deterministic scan**: No raw hex colors were found; the modals successfully use `m3-surface-container`, `m3-primary`, and other standard tokens.

#### Overall Impression
While the modals look great visually, they break the immersive experience by falling back on native browser dialogues for errors and confirmations. They also lack the basic keyboard accessibility expected of a modern web application.

#### Priority Issues
- **[P1] Jarring Native Alerts**: Error states and the delete confirmation use native browser `alert()` and `confirm()`. 
  - *Why it matters*: It breaks the highly polished, immersive M3 aesthetic and damages user trust.
  - *Fix*: Introduce custom M3 `toast` notifications for errors and a custom `confirmDialog` state for deletions, matching what we did on the home page.
  - *Suggested command*: `/impeccable harden`

- **[P1] Missing Keyboard Accessibility**: Modals cannot be closed with the Escape key.
  - *Why it matters*: Power users expect to dismiss overlays rapidly; forcing them to click the 'X' or backdrop creates friction.
  - *Fix*: Add a global `keydown` event listener in a `useEffect` that listens for the Escape key and triggers the modal close function.
  - *Suggested command*: `/impeccable polish`

#### Persona Red Flags

**Alex (Power User / Admin)**:
- Alex will be annoyed that they have to reach for the mouse to close the modal after reviewing a rendition, rather than just hitting Escape.

**Jordan (First-Timer)**:
- If a URL format is rejected by the database, they get a scary native browser alert that makes the site feel broken.

#### Minor Observations
- **Architecture**: `EditRenditionModal` uses `createPortal` but `AddRenditionModal` does not. While this works visually, it's structurally inconsistent. Furthermore, mapping `EditRenditionModal` inside the video list means if a bandish has 20 videos, 20 hidden modals are rendered into the DOM. This is a minor performance anti-pattern.
