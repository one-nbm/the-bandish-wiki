---
target: WelcomeScreen.tsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\neill\\bandish-wiki\\src\\components\\WelcomeScreen.tsx"
target_fingerprint: "sha256:1dab2ac4db06947a1e2d3e2bd2e3145e7445b27d0acd80688907bcb34a7213fd"
target_path: "C:\\Users\\neill\\bandish-wiki\\src\\components\\WelcomeScreen.tsx"
timestamp: 2026-09-27T18-18-43Z
slug: src-components-welcomescreen-tsx
---
# Critique: src/components/WelcomeScreen.tsx

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No loading skeleton while featuredRaag fetches |
| 2 | Match System / Real World | 4 | Samay framing is authentic to Hindustani theory |
| 3 | User Control and Freedom | 3 | No skip-to-archive without card interaction |
| 4 | Consistency and Standards | 3 | Cards match system tokens but search button is only solid fill |
| 5 | Error Prevention | 2 | DB fetch failure silently collapses the card |
| 6 | Recognition Rather Than Recall | 3 | Placeholder and labels are clear |
| 7 | Flexibility and Efficiency | 2 | Ctrl+K undisclosed; empty Enter does nothing |
| 8 | Aesthetic and Minimalist Design | 3 | Clean; cards feel orphaned when only one populates |
| 9 | Error Recovery | 1 | Zero recovery surface for DB/fetch failures |
| 10 | Help and Documentation | 2 | No count/preview on browse card |
| **Total** | | **25/40** | **Acceptable** |

## Priority Issues
- [P1] No loading skeleton for Featured Raag card
- [P1] Silent failure on DB error/empty pool
- [P2] Featured Raag card lacks cultural depth (no thaat/count)
- [P2] Empty Enter submit is silent — no feedback
- [P3] "Explore" eyebrow kicker banned by craft-floor
