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
5. **MORPHING MODALS**: When opening or closing a modal, the modal should animate from the size and position of the element that triggered it, and the source card should not be visible or fade out when the modal is open.
6. **Z-INDEX STRATA**: NEVER use z-indexes higher than 40. 
- Base Grid Elements: `z-1` to `z-10`
- Sticky Header / Glur: `z-40`
- Modals / Overlays: `z-50` to `z-60`
- Toasts / Dialogs: `z-70` to `z-80`
- *(Never elevate animated grid items above z-40 so they slide under the header).*    


<!-- END:bandish-wiki-design-rules -->

<!-- BEGIN:agent-behavior-rules -->

# Agent Behavior Rules (STRICT)
1. Before writing any code, list the potential edge cases, explain your architectural approach, and outline the steps you will take.
2. Do not use placeholders, code omissions, or TODO comments. Write out the complete, functional implementation from start to finish.
3. After you write code that optimizes performance, rate it on 1-10 on how well it will help the performance of the site, and keep editing until you reach at least an 8/10

<!-- END:agent-behavior-rules -->


