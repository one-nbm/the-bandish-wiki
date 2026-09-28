<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:bandish-wiki-design-rules -->

# Design System Rules (STRICT)
1. **NO SHADOWS:** Never use Tailwind `shadow-*` classes anywhere in this project. The design system is strictly flat.
2. **ELEVATION:** Achieve depth and interactive elevation exclusively through `border` classes (e.g., `border-m3-surface-high`) and hover transforms (e.g., `hover:-translate-y-1`).
3. **MODALS:** Modals and floating elements must use borders to separate themselves from the background, not shadows.
4. **BLUR / GLUR:** When using progressive blurs or `backdrop-filter`, ensure the container has no `transform` properties (like `translateZ(0)`) that would flatten the stacking context and break the blur.

<!-- END:bandish-wiki-design-rules -->
