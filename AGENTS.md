# CaddiePro - Agent Development Guide

Multi-sport venue management system. **Tech Stack:** React 19, TypeScript, Tailwind CSS, Vite, Zustand.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # TypeScript compile + Vite build
npm run type-check       # TypeScript check without emit

# Linting & Formatting
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format
npm run format:check     # Prettier check

# Testing (Vitest + Playwright)
npm run test             # Run all unit tests
npm run test -- path/to/file.test.tsx           # Run single test file
npm run test -- -t "test name"                  # Run tests matching name
npm run test:coverage    # Run tests with coverage (80% threshold)
npm run test:ui          # Vitest UI
npm run test:e2e         # Playwright E2E tests
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
8. **No path aliases for file tools** - Never use `@/` to access files with tools (Read, Write, Edit, Glob). Always use relative paths (`./`) or absolute paths.

## File Structure

```
src/
  components/
    ui/           # Reusable: Button, Input, Modal
    layout/       # Header, Sidebar, Layout
    features/     # Feature components (CaddieManager, WeeklyDraw)
  hooks/          # Custom hooks (business logic state)
  services/       # API, data operations, pure logic
  stores/         # Zustand global state
  types/          # TypeScript definitions
  utils/          # Pure utility functions (time, validation)
  tests/          # Test setup and utilities
```

## Code Style

### Formatting (Prettier)
- No semicolons, single quotes, 2-space indentation.
- Trailing commas (ES5), 100 char line width.

### Import Order (Enforced)
1. React imports
2. Third-party libraries
3. Types (`import type { ... }` - required by ESLint)
4. Local services/hooks/components (using `@/` alias)
5. Styles (last)

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CaddieManager.tsx` |
| Hooks | camelCase + use prefix | `useCaddies.ts` |
| Services | camelCase | `caddieService.ts` |
| Types/Interfaces | PascalCase | `interface Caddie` |
| Constants | UPPER_SNAKE_CASE | `INITIAL_CADDIES` |
| CSS classes | kebab-case (BEM) | `.caddie-manager__header` |

### Component & Hook Patterns
- Use `React.FC<Props>` for components.
- Define props in separate `.types.ts` file if they exceed 5 lines.
- Wrap complex handlers in `useCallback`.
- Use `useMemo` for derived data (e.g., filtered lists).

## Error Handling & Logging

- Use the central `logger` utility (`src/utils/logger.ts`) for state changes and errors.
- Services should throw `ServiceError` (from `src/types/store.types.ts`).
- Hooks must expose `error` and `loading` states.

## TypeScript & Testing

- Use `interface` for object shapes, `type` for unions/aliases.
- Unit tests: `ComponentName.test.tsx` using Vitest + RTL.
- E2E tests: Playwright for critical flows (dispatch, scheduling).
- Coverage: Maintain >80% coverage on all business logic.

## State Management (Zustand)

- **CaddieStore**: Master data, dispatch batches.
- **ListStore**: Turn configuration and sorting.
- **ScheduleStore**: Weekly shifts and assignments.
- **UIStore**: Modals, notifications, global UI state.
