---
name: Bandish Wiki
description: A fast, searchable database and community platform for Indian Classical bandishes.
colors:
  primary: "#6750A4"
  secondary: "#7D5260"
  tertiary: "#7D5700"
  surface: "#FEF7FF"
  surface-container: "#F3EDF7"
  surface-high: "#EADDFF"
  error: "#BA1A1A"
typography:
  body:
    fontFamily: "var(--font-google-sans), sans-serif"
rounded:
  full: "9999px"
  lg: "1.5rem"
  xl: "2.5rem"
spacing:
  container-px: "1rem"
  card-p: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "0.75rem 1.25rem"
  card:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-p}"
---

# Design System: Bandish Wiki

## Overview

**Creative North Star: "The Melodic Archive"**

The system is focused on preservation and easy retrieval, but it is not a dusty ledger. It is tactile and responsive, built around a vibrant Material 3 color palette. Elements spring to life with playful scaling and transitions to invite interaction, making practice and discovery feel dynamic.

**Key Characteristics:**
- High-contrast, expressive Material 3 colors.
- Extreme roundness on interactive elements and containers.
- Playful spring physics on hover and active states (`cubic-bezier(0.34,1.56,0.64,1)`).
- Tonal backgrounds and borders instead of drop shadows at rest.

## Colors

A vibrant and saturated Material Design 3 palette that uses tonal shifts to communicate hierarchy.

### Primary
- **M3 Deep Purple** (#6750A4): The main brand accent. Used for primary buttons, active states, and critical actions.

### Secondary
- **M3 Muted Rose** (#7D5260): Used for tags, secondary actions, and subtle highlights. 

### Tertiary
- **M3 Warm Gold** (#7D5700): Used for composer tags and distinct alternative actions.

### Neutral
- **M3 Surface** (#FEF7FF): The default page background.
- **M3 Surface Container** (#F3EDF7): Used for card backgrounds and form inputs.
- **M3 Surface High** (#EADDFF): Used for borders and slightly elevated states.

### Named Rules
**The Tonal Border Rule.** Instead of gray borders, all borders derive from the `surface-high` token of the current active theme, ensuring they blend harmoniously with the background.

## Typography

**Body Font:** Google Sans (via `var(--font-google-sans)`)

**Character:** Clean, round, and highly legible, optimized for both English transliteration and reading at a glance.

### Hierarchy
- **Title** (bold, 2xl/3xl): Used for Bandish titles and modal headers.
- **Body** (medium, base/lg): Used for lyrics and general UI text.
- **Label** (bold, text-xs, tracking-wider, uppercase): Used for form field labels and small metadata.

### Named Rules
**The Generous Line-Height Rule.** Lyrics and notation require breathing room. Always use relaxed leading (`leading-relaxed`) to prevent dense blocks of text.

## Layout

The application uses a flexible, maximum-width container (`max-w-5xl`) centered on the screen, ensuring readability on large monitors. Bandish cards are displayed in a responsive masonry grid (`columns-1 md:columns-2`) to accommodate varying lyrics lengths seamlessly.

## Elevation & Depth

Flat by default, but elements physically lift and scale up (using spring physics) when hovered or interacted with. 

### Named Rules
**The Physical Lift Rule.** We do not use drop shadows. Elevation is communicated entirely through scale and translation (`hover:-translate-y-2 hover:scale-[1.01]`).

## Shapes

The form language is extremely soft and pill-like, heavily utilizing maximum border radiuses.
- Buttons and tags are always perfectly pill-shaped (`rounded-full`).
- Cards and modals use exaggerated corner radiuses (`rounded-[2.5rem]` or `rounded-[1.5rem]`).

## Components

### Buttons
- **Shape:** Perfectly pill-shaped (`rounded-full`).
- **Primary:** Purple background (`bg-m3-primary`), white text.
- **Hover / Focus:** Scales up (`hover:scale-[1.05]`), active state shrinks (`active:scale-95`). Uses custom spring bezier.

### Cards / Containers
- **Corner Style:** Exaggerated roundness (`rounded-[2.5rem]` or `rounded-3xl`).
- **Background:** `bg-m3-surface-container` (or `bg-white` with a border).
- **Hover:** Shifts upward (`-translate-y-2`) and scales slightly.

### Tags / Chips
- **Style:** Tonal background (`bg-m3-secondary/10`) with matching text color.
- **State:** Pills are highly interactive, scaling on hover just like buttons.

## Do's and Don'ts

### Do:
- **Do** use `cubic-bezier(0.34,1.56,0.64,1)` for all interactive scaling transitions.
- **Do** use tonal backgrounds (e.g., `bg-m3-primary/10`) for subtle emphasis instead of gray boxes.

### Don't:
- **Don't** use `box-shadow` to elevate cards. Rely on the hover scale and translate effect.
- **Don't** use sharp corners (`rounded-sm` or `rounded-none`). The system requires soft geometry.
