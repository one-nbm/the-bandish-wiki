---
target: WelcomeScreen.tsx
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:C:\\Users\\neill\\bandish-wiki\\src\\components\\WelcomeScreen.tsx"
target_fingerprint: "sha256:21e95860aed7c5094dd46feabf204e4e5acccf20d7746853d06b54958e559efe"
target_path: "C:\\Users\\neill\\bandish-wiki\\src\\components\\WelcomeScreen.tsx"
timestamp: 2026-09-27T18-25-28Z
slug: src-components-welcomescreen-tsx
---
# Critique: src/components/WelcomeScreen.tsx — Run 2

Score: 31/40 (Good). Up from 25/40.

## Priority Issues
- [P2] "Samay" unexplained for newcomers — add tooltip or parenthetical
- [P2] Archive card subtitle verbose — replace "all raags & taals" with unique raag count
- [P2] Ctrl+K undisclosed — add pill hint inside search bar
- [P3] getSamayFromHour defined inside component — move outside

## Minor
- &amp; in line 185 renders fine but worth noting
- Fallback pool needs .order("name") for stability
- bandishCount != null could be >= 0 for clarity
