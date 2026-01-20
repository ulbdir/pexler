# AGENTS.md

This document provides guidelines for agentic coding agents working in this repository.

## Project Overview

Pexler is a browser-based pixel art drawing application built with **Svelte 5**, **Vite**, and **Tailwind CSS v4**. It uses DaisyUI for components and svelte-i18n for localization.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (output to `dist/`) |
| `npm run preview` | Preview production build locally |

There are no dedicated lint or test scripts configured. The project uses basic JavaScript checking via jsconfig.json.

## Code Style Guidelines

### General Principles

- Prefer Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) over Svelte 4 stores
- Use classes for domain objects (tools, utilities, state containers)
- Keep functions small and focused
- Avoid unnecessary comments; let code speak for itself
- Handle errors explicitly with `throw new Error()` for invalid states

### TypeScript Usage

- Use TypeScript for all `.ts` files and Svelte components with `lang="ts"`
- Use `import type` for type-only imports to avoid runtime dependencies
- Enable `verbatimModuleSyntax: true` in jsconfig.json
- Define interfaces for complex object shapes (e.g., `EditorState`)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `DrawTool`, `Color`, `EditorState` |
| Interfaces | PascalCase | `EditorState` (used as type) |
| Variables/Properties | camelCase | `hoverX`, `drawingColor` |
| Functions | camelCase | `toCssRgba()`, `getPixelCoordinates()` |
| Constants | UPPER_SNAKE_CASE (if truly constant) | `MAX_ZOOM` |
| Svelte props | camelCase (destructured in `$props()`) | `grid`, `pixels` |

### Imports

```typescript
// Type-only imports (preferred)
import type { Tool } from "./Tool";

// Named imports
import { editorState } from "./EditorState.svelte";
import { addColor } from "./Palette.svelte";

// Default imports for Svelte components
import PixelCanvas from "./PixelCanvas.svelte";

// Relative paths: prefer ./ and ../ over absolute imports
```

### Svelte 5 Component Structure

```svelte
<script lang="ts">
    import type { Color } from "./lib/Color";
    import { editorState } from "./lib/EditorState.svelte";

    let {
        grid = true,
        pixels,
    } = $props<{
        grid?: boolean;
        pixels: HTMLCanvasElement;
    }>();

    let pixelSize: number = $state(20);
    let canvasWidth = $derived(pixels.width * pixelSize);

    $effect(() => {
        // reactive logic
    });
</script>

<template>
    <!-- markup here -->
</template>

<style>
    /* component-scoped styles */
</style>
```

### Tailwind CSS

- Use Tailwind utility classes for all styling
- DaisyUI themes available via `data-theme` attribute or config
- Custom classes defined in `<style>` blocks for complex rules
- Example: `class="flex flex-col w-screen h-screen p-1 overflow-hidden bg-base-200"`

### State Management

- Use `$state()` for reactive primitives and objects
- Use `$derived()` for computed values
- Use `$effect()` for side effects and subscriptions
- Prefer `$state` over stores for component-local state
- Use global `$state` objects (like `editorState`) for application-wide state

### Error Handling

- Throw errors for invalid inputs: `throw new Error('Invalid hex color format')`
- Return early when possible to reduce nesting
- Check for null/undefined before accessing properties
- Use optional chaining and nullish coalescing where appropriate

### File Organization

```
src/
├── lib/              # Shared utilities, classes, components
│   ├── *.ts          # Domain classes (Color.ts, Tool.ts)
│   ├── *.svelte.ts   # State containers (EditorState.svelte.ts)
│   ├── i18n/         # Localization
│   └── Icons.js      # Icon definitions
├── *.svelte          # Page components
├── App.svelte        # Root component
├── main.js           # Entry point
└── app.css           # Global styles
```

### Canvas and Graphics

- Set `imageSmoothingEnabled = false` for pixel-art rendering
- Use `Math.floor()` for pixel coordinates
- Store pixel data in off-screen canvas elements

### Localization

- Use `svelte-i18n` for translations
- Store locale files in `src/lib/i18n/locales/`
- Access with `$t('key')` in templates

## Deployment

The project deploys to GitHub Pages via the `base: "/pexler/"` configuration in vite.config.js. Build output goes to the `dist/` directory.

---

## Code Review Agent

When reviewing code in this repository, check for the following:

### Svelte 5 Runes
- Components use `$state()`, `$derived()`, `$effect()`, `$props()` (not Svelte 4 stores)
- State containers use `.svelte.ts` extension (e.g., `EditorState.svelte.ts`)
- Global state is accessed via `$state` objects like `editorState`

### TypeScript
- Use `import type` for type-only imports
- Enable `verbatimModuleSyntax: true` compliance
- Define interfaces for complex objects

### Styling
- Use Tailwind utility classes
- DaisyUI themes configured in `app.css`
- Complex styles in `<style>` blocks

### Canvas/Pixel Art
- `imageSmoothingEnabled = false` for crisp pixels
- Use `Math.floor()` for coordinates
- Off-screen canvas for pixel data storage

### Error Handling
- Invalid states throw `new Error()`
- Return early to reduce nesting
- Use optional chaining for null checks

### Code Quality
- Prefer simple, straightforward solutions over complex ones
- Keep functions small and focused on a single responsibility
- Avoid code duplication; extract reusable logic
- Don't over-engineer; solve the problem at hand
- Use descriptive names for variables and functions
- Avoid magic numbers; use constants instead

### Anti-Patterns to Avoid
- Don't use Svelte 4 stores when Svelte 5 runes suffice
- Avoid nested conditionals; use guard clauses and early returns
- Don't ignore returned values from functions without reason
- Avoid tight coupling between unrelated components
- Don't leave commented-out code in the codebase
- Avoid mixing concerns (e.g., UI logic with business logic)
