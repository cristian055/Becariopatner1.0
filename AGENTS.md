# CaddiePro - Agent Development Guide

Multi-sport venue management system. **Tech Stack:** React 19, TypeScript, Tailwind CSS, Vite, Zustand.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 3000, host 0.0.0.0)
npm run build            # TypeScript compile + Vite build
npm run type-check       # TypeScript check without emit
npm run preview          # Preview production build

# Linting & Formatting
npm run lint             # ESLint check (max 0 warnings)
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format (includes tailwind-merge)
npm run format:check     # Prettier check

# Testing (Vitest + Playwright)
npm run test             # Run all unit tests
npm run test -- path/to/file.test.tsx           # Run single test file
npm run test -- -t "test name"                  # Run tests matching name
npm run test:coverage    # Run tests with coverage (80% threshold)
npm run test:ui          # Vitest UI mode
npm run test:e2e         # Playwright E2E tests (3 browsers)
npm run test:e2e:ui      # Playwright UI mode
```

## Critical Standards

1. **English only** - All code, comments, UI text, documentation.
2. **No emojis** - Professional code only.
3. **No business logic in components** - Extract to hooks/services.
4. **Every component needs a .css file** with the same name.
5. **Max 200 lines per component** - Split if exceeded.
6. **No `any` types** - TypeScript strict mode enabled.
7. **Clean commits** - Only commit functional, type-safe code.
8. **No path aliases for file tools** - Never use `@/` to access files with tools (Read, Write, Edit, Glob). Use relative paths `./` or absolute paths.
9. **Singleton services** - Export class instances (e.g., `export const caddieService = new CaddieService()`)

## File Structure

```
src/
  components/
    ui/           # Reusable: Button, Input, Modal, Badge, Tabs
    layout/       # Header, Sidebar, Layout
    features/     # Feature components (CaddieManager, WeeklyDraw)
  hooks/          # Custom hooks (business logic state, no UI)
  services/       # API clients, business logic, validation
  stores/         # Zustand global state (CaddieStore, ListStore, ScheduleStore, UIStore)
  types/          # TypeScript definitions (store.types.ts for shared types)
  utils/          # Pure utilities (logger, filters, sorters, validation, time)
  tests/          # Test setup (setup.ts) and utilities
```

## Code Style

### Formatting (Prettier)
- No semicolons, single quotes, 2-space indentation.
- Trailing commas (ES5), 100 char line width, LF line endings.
- Arrow parens always, bracket spacing enabled.
- CSS uses double quotes, 2-space indentation.

### Import Order (Enforced by ESLint)
1. React imports (`import * as React from 'react'`)
2. Third-party libraries (Radix UI, lucide-react, recharts, etc.)
3. Types (`import type { ... }` - ESLint error if missing)
4. Local imports with `@/` alias (`import { something } from '@/services'`)
5. Styles (last, use relative paths for CSS)

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CaddieManager.tsx` |
| Hooks | camelCase + use prefix | `useCaddies.ts` |
| Services | camelCase + Service suffix | `caddieService.ts` |
| Service classes | PascalCase + Service | `class CaddieService` |
| Types/Interfaces | PascalCase | `interface Caddie` |
| Constants | UPPER_SNAKE_CASE | `INITIAL_CADDIES` |
| CSS classes | kebab-case (BEM) | `.caddie-manager__header` |
| Error codes | UPPER_SNAKE_CASE | `ERROR_CODES.VALIDATION_ERROR` |

### Component & Hook Patterns
- Use `React.FC<Props>` for components with type inference.
- Define props in separate `.types.ts` file if they exceed 5 lines.
- Wrap complex handlers in `useCallback` to prevent re-renders.
- Use `useMemo` for derived data (filtered lists, computed statistics).
- Hooks return `{ data, loading, error, ...actions }` object.

## Error Handling & Logging

- Use central `logger` utility (`src/utils/logger.ts`) for all logging.
- Logger methods: `debug()`, `info()`, `warn()`, `error()`, `serviceError()`, `apiCall()`, `apiResponse()`, `apiError()`, `action()`, `stateChange()`, `performance()`.
- Services throw `ServiceError(message, code, details)` from `src/types/store.types.ts`.
- Hooks must expose `error: string | null` and `loading: boolean` states.
- Validation utils return `{ valid: boolean, errors: string[] }`.

## TypeScript Rules (Strict Mode)

- `interface` for object shapes, `type` for unions/aliases/primitives.
- Unused vars prefixed with `_` are allowed (argsIgnorePattern, varsIgnorePattern).
- No non-null assertions (`!`) without justification.
- Explicit function return types recommended (ESLint warn).
- `noUncheckedIndexedAccess` enabled - handle undefined from array/object access.
- Consistent type imports enforced: `import type { ... }` for types only.

## Testing

### Unit Tests (Vitest + RTL)
- Test files: `ComponentName.test.tsx` alongside component.
- Use `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- Structure: `describe('Component Name', () => { it('should...', () => {}) })`
- Mock external dependencies with `vi.fn()`, `vi.mock()`.
- Clean DOM in `beforeEach` if needed.

### Coverage (80% Threshold)
- Lines, functions, branches, statements all require 80%+ coverage.
- Excludes: `node_modules/`, `src/tests/`, `*.config.ts/js`, `*.test.tsx`.
- Run: `npm run test:coverage` (generates text, json, html reports).

### E2E Tests (Playwright)
- Directory: `tests/e2e/` (note: not `src/`).
- Browsers: Chromium, Firefox, WebKit.
- Base URL: `http://localhost:3000`
- Run: `npm run test:e2e` (starts dev server automatically).

## State Management (Zustand)

- **CaddieStore**: Master data, dispatch batches, CRUD operations.
- **ListStore**: Turn configuration and sorting logic.
- **ScheduleStore**: Weekly shifts and assignments management.
- **UIStore**: Modals, notifications, global UI state.
- All stores export typed interfaces for type safety.

## Path Aliases

- Use `@/` alias for imports within code (configured in vite.config.ts).
- Map: `@/*` → `./src/*`
- Never use `@/` with file tools (Read, Write, Edit, Glob) - use relative/absolute paths.
